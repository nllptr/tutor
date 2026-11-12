import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron, expect } from '@playwright/test'

const profile = await mkdtemp(join(tmpdir(), 'tutor-smoke-'))
let app
try {
  app = await electron.launch({
    args: ['.', ...(process.platform === 'linux' ? ['--disable-dev-shm-usage', '--password-store=basic'] : [])],
    env: { ...process.env, NODE_ENV: 'test', TUTOR_TEST_PROFILE: profile, XDG_CONFIG_HOME: profile, XDG_CACHE_HOME: profile },
    timeout: 30_000
  })
  const page = await app.firstWindow()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await expect(page.getByRole('heading', { name: 'ChatGPT connection' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Refresh status' })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Connect ChatGPT' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Send test prompt' })).toBeDisabled()
  await page.getByLabel('Prompt draft').fill('Which case is the subject?')
  await expect(page.getByLabel('Prompt draft')).toHaveValue('Which case is the subject?')
  const boundary = await page.evaluate(async () => ({
    process: typeof window.process,
    require: typeof window.require,
    exposed: Object.keys(window.tutor),
    status: await window.tutor.getConnectionStatus()
  }))
  assert.equal(boundary.process, 'undefined')
  assert.equal(boundary.require, 'undefined')
  assert.deepEqual(boundary.exposed.sort(), ['cancel', 'connect', 'disconnect', 'getConnectionStatus', 'listModels', 'onDelta', 'sendPrompt'])
  assert.equal(boundary.status.ok, true)
  assert.ok(['disconnected', 'unavailable'].includes(boundary.status.value.state))
  const invalid = await page.evaluate(() => window.tutor.sendPrompt({ id: 'test', model: 'test', prompt: '', apiKey: 'forbidden' }))
  assert.equal(invalid.ok, false)
  assert.equal(invalid.error.code, 'invalid_request')
  if (process.platform === 'linux') {
    assert.equal(boundary.status.value.storageAvailable, false)
    const denied = await page.evaluate(() => window.tutor.connect())
    assert.equal(denied.ok, false)
    assert.equal(denied.error.code, 'storage_unavailable')
  }
  const preferences = await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0]
    const { contextIsolation, nodeIntegration, sandbox, webSecurity } = window.webContents.getLastWebPreferences()
    return { contextIsolation, nodeIntegration, sandbox, webSecurity }
  })
  assert.deepEqual(preferences, { contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true })
  await page.evaluate(() => window.open('https://example.com'))
  assert.equal(app.windows().length, 1)
  assert.deepEqual(errors, [])
  console.log('Electron smoke passed: rendered shell, editable draft, disconnected inference, isolated renderer, validated IPC, protected-storage gate, denied popup.')
} finally {
  if (app) await app.close()
  await rm(profile, { recursive: true, force: true })
}
