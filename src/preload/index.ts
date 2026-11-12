import { contextBridge, ipcRenderer } from 'electron'
import { CHANNELS, type ResponseDelta, type TutorDesktop } from '../shared/desktop'

const desktop: TutorDesktop = {
  getConnectionStatus: () => ipcRenderer.invoke(CHANNELS.status),
  connect: () => ipcRenderer.invoke(CHANNELS.connect),
  cancel: () => ipcRenderer.invoke(CHANNELS.cancel),
  disconnect: () => ipcRenderer.invoke(CHANNELS.disconnect),
  listModels: () => ipcRenderer.invoke(CHANNELS.models),
  sendPrompt: (request) => ipcRenderer.invoke(CHANNELS.send, request),
  onDelta: (listener) => {
    const receive = (_event: Electron.IpcRendererEvent, value: ResponseDelta) => listener(value)
    ipcRenderer.on(CHANNELS.delta, receive)
    return () => { ipcRenderer.removeListener(CHANNELS.delta, receive) }
  }
}
contextBridge.exposeInMainWorld('tutor', desktop)
