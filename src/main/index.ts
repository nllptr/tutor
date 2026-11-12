import { app, BrowserWindow, ipcMain, safeStorage, session, shell } from 'electron'
import { createChatGPT, ChatGPTError } from '@siwc/local'
import { isAbsolute, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { CHANNELS } from '../shared/desktop'
import { credentialEncryption } from './credentials'
import { integration, parsePrompt, safely } from './integration'

const developmentUrl = process.env.ELECTRON_RENDERER_URL
const rendererFile = join(import.meta.dirname, '../renderer/index.html')
const rendererUrl = pathToFileURL(rendererFile).href
let cancelWork: (() => void) | undefined

function trustedRenderer(url: string): boolean {
  try { return developmentUrl ? url === new URL(developmentUrl).href : url === rendererUrl }
  catch { return false }
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1000, height: 850, minWidth: 620, minHeight: 520,
    title: 'Tutor', backgroundColor: '#111827',
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/index.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true
    }
  })
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event) => event.preventDefault())
  window.webContents.on('will-attach-webview', (event) => event.preventDefault())
  window.on('closed', () => cancelWork?.())
  if (developmentUrl) void window.loadURL(developmentUrl)
  else void window.loadFile(rendererFile)
}

app.setName('Tutor')
// Isolate credential files during automated tests, including on macOS.
if (!app.isPackaged && process.env.NODE_ENV === 'test' && process.env.TUTOR_TEST_PROFILE && isAbsolute(process.env.TUTOR_TEST_PROFILE)) {
  app.setPath('userData', process.env.TUTOR_TEST_PROFILE)
}
if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0]
    if (window?.isMinimized()) window.restore()
    window?.focus()
  })
  app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
    session.defaultSession.setPermissionCheckHandler(() => false)
    const encryption = credentialEncryption(safeStorage, () => app.isReady())
    const client = createChatGPT({
      appName: 'Tutor', appId: 'dev.tutor.desktop', redirectPort: 0,
      storageDir: join(app.getPath('userData'), 'chatgpt'),
      credentialEncryption: encryption, sendHostId: true,
      openBrowser: async (value) => {
        const url = new URL(value)
        if (url.origin !== 'https://auth.openai.com' || url.username || url.password) throw new ChatGPTError('invalid_authorization_url', 'The authorization URL could not be verified.')
        await shell.openExternal(url.href)
      }
    })
    const connection = integration(client, encryption)
    cancelWork = connection.cancel
    for (const channel of [CHANNELS.status, CHANNELS.connect, CHANNELS.cancel, CHANNELS.disconnect, CHANNELS.models, CHANNELS.send]) {
      ipcMain.handle(channel, async (event, ...args: unknown[]) => {
        if (!event.senderFrame || event.senderFrame !== event.sender.mainFrame || !trustedRenderer(event.senderFrame.url)) {
          return { ok: false, error: { code: 'unauthorized', message: 'This request is not allowed.' } }
        }
        if (args.length !== (channel === CHANNELS.send ? 1 : 0)) {
          return { ok: false, error: { code: 'invalid_request', message: 'Invalid request.' } }
        }
        return safely(async () => {
          switch (channel) {
            case CHANNELS.status: return connection.status()
            case CHANNELS.connect: return connection.connect()
            case CHANNELS.cancel: return connection.cancel()
            case CHANNELS.disconnect: return connection.disconnect()
            case CHANNELS.models: return connection.listModels()
            case CHANNELS.send: {
              let request
              try { request = parsePrompt(args[0]) }
              catch { throw new ChatGPTError('invalid_request', 'Enter a prompt of at most 20,000 characters and choose an available model.') }
              return connection.send(request, (delta) => {
                if (!event.sender.isDestroyed() && trustedRenderer(event.sender.getURL())) event.sender.send(CHANNELS.delta, delta)
              })
            }
          }
        })
      })
    }
    createWindow()
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
  }).catch(() => { console.error('Tutor could not start.'); app.exit(1) })
}
app.on('before-quit', () => cancelWork?.())
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
