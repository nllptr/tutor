import { describe, it, expect, vi } from 'vitest'
import { ChatGPTError, type ChatGPTClient, type CredentialEncryption, type StreamResponseOptions } from '@siwc/local'
import { integration, parsePrompt, safely } from '../src/main/integration'
import { credentialEncryption } from '../src/main/credentials'

function fixture() {
  const encryption: CredentialEncryption = {
    id: 'test-only', isAvailable: vi.fn(() => true),
    encrypt: vi.fn(), decrypt: vi.fn()
  }
  const client: ChatGPTClient = {
    signIn: vi.fn(async () => ({ status: 'connected' as const, sharing: true })),
    getSession: vi.fn(async () => ({ status: 'disconnected' as const, sharing: false })),
    cancelSignIn: vi.fn(), disconnect: vi.fn(async () => {}),
    listProfiles: vi.fn(async () => []), selectProfile: vi.fn(), subscribe: vi.fn(),
    listModels: vi.fn(async () => [{ slug: 'eligible-model', displayName: 'Eligible model' }]),
    streamResponse: vi.fn(async () => ({ text: 'Completed answer' }))
  }
  return { client, encryption, connection: integration(client, encryption) }
}
const prompt = { id: 'request-1', model: 'eligible-model', prompt: 'Explain nominative.' }

describe('subscription integration', () => {
  it('does not start authorization without protected credential storage', async () => {
    const { connection, encryption, client } = fixture()
    encryption.isAvailable = () => false
    expect(await connection.status()).toMatchObject({ state: 'unavailable', storageAvailable: false })
    const result = await safely(() => connection.connect())
    expect(result).toMatchObject({ ok: false, error: { code: 'storage_unavailable' } })
    expect(client.signIn).not.toHaveBeenCalled()
  })

  it('only sends to an account-discovered model and forwards exactly the chosen prompt', async () => {
    const { connection, client } = fixture()
    expect(await safely(() => connection.send(prompt, () => {}))).toMatchObject({ ok: false, error: { code: 'model_unavailable' } })
    expect(client.streamResponse).not.toHaveBeenCalled()
    await connection.listModels()
    const delta = vi.fn()
    vi.mocked(client.streamResponse).mockImplementationOnce(async (options) => {
      options.onDelta?.('Completed ')
      options.onDelta?.('answer')
      return { text: 'Completed answer' }
    })
    expect(await connection.send(prompt, delta)).toEqual({ text: 'Completed answer' })
    expect(client.streamResponse).toHaveBeenCalledWith(expect.objectContaining({
      model: 'eligible-model', input: [{ role: 'user', content: 'Explain nominative.' }]
    }))
    expect(delta).toHaveBeenCalledWith({ id: 'request-1', text: 'Completed ' })
    expect(delta).toHaveBeenCalledWith({ id: 'request-1', text: 'answer' })
  })

  it('cancellation prevents a late successful response from being reported as completed', async () => {
    const { connection, client } = fixture()
    await connection.listModels()
    let finish!: (value: { text: string }) => void
    let options!: StreamResponseOptions
    vi.mocked(client.streamResponse).mockImplementationOnce((value) => {
      options = value
      return new Promise((resolve) => { finish = resolve })
    })
    const delta = vi.fn()
    const pending = safely(() => connection.send(prompt, delta))
    expect(await safely(() => connection.listModels())).toMatchObject({ ok: false, error: { code: 'busy' } })
    connection.cancel()
    expect(options.signal?.aborted).toBe(true)
    options.onDelta?.('late output')
    finish({ text: 'late output' })
    expect(await pending).toMatchObject({ ok: false, error: { code: 'cancelled' } })
    expect(delta).not.toHaveBeenCalled()
  })

  it('reports incomplete and quota failures without a silent retry', async () => {
    const { connection, client } = fixture()
    await connection.listModels()
    vi.mocked(client.streamResponse).mockRejectedValueOnce(new ChatGPTError('subscription_sharing_usage_limit_exceeded', 'A sharing limit was reached.'))
    const result = await safely(() => connection.send(prompt, () => {}))
    expect(result).toMatchObject({ ok: false, error: { code: 'subscription_sharing_usage_limit_exceeded' } })
    expect(client.streamResponse).toHaveBeenCalledTimes(1)
    vi.mocked(client.streamResponse).mockRejectedValueOnce(new ChatGPTError('stream_interrupted', 'The response ended before completion.'))
    expect(await safely(() => connection.send(prompt, () => {}))).toMatchObject({ ok: false, error: { code: 'stream_interrupted' } })
  })

  it('preserves reauthentication and unconfirmed revocation as visible states', async () => {
    const { connection, client } = fixture()
    vi.mocked(client.getSession).mockResolvedValue({ status: 'reauth_required', sharing: false })
    expect(await connection.status()).toMatchObject({ state: 'reauth_required', sharing: false })
    await connection.listModels()
    vi.mocked(client.disconnect).mockRejectedValueOnce(new ChatGPTError('revocation_failed', 'Local credentials removed; remote revocation is unconfirmed.'))
    expect(await safely(() => connection.disconnect())).toMatchObject({ ok: false, error: { code: 'revocation_failed' } })
    expect(await safely(() => connection.send(prompt, () => {}))).toMatchObject({ ok: false, error: { code: 'model_unavailable' } })
  })

  it('does not expose arbitrary exception text across IPC', async () => {
    const result = await safely(async () => { throw new Error('access_token=private-test-marker') })
    expect(JSON.stringify(result)).not.toContain('private-test-marker')
    expect(result).toMatchObject({ ok: false, error: { code: 'local_error' } })
  })
})

describe('IPC payload validation', () => {
  it.each([null, [], {}, { ...prompt, apiKey: 'forbidden' }, { ...prompt, prompt: ' ' },
    { ...prompt, prompt: 'x'.repeat(20_001) }, { ...prompt, id: '<script>' }, { ...prompt, model: 1 }])('rejects malformed or expanded request %#', (value) => {
    expect(() => parsePrompt(value)).toThrow()
  })
})

describe('OS credential encryption', () => {
  it('rejects Linux basic_text even when Electron says encryption is available', async () => {
    const storage = {
      isEncryptionAvailable: () => true, getSelectedStorageBackend: () => 'basic_text' as const,
      encryptString: vi.fn(), decryptString: vi.fn()
    }
    const encryption = credentialEncryption(storage, () => true, 'linux')
    expect(await encryption.isAvailable()).toBe(false)
    expect(() => encryption.encrypt('secret')).toThrow()
    expect(() => encryption.decrypt(new Uint8Array())).toThrow()
    expect(storage.encryptString).not.toHaveBeenCalled()
    expect(storage.decryptString).not.toHaveBeenCalled()
  })
  it('requires readiness and encryption availability on macOS as well', async () => {
    const storage = {
      isEncryptionAvailable: vi.fn(() => false), getSelectedStorageBackend: vi.fn(),
      encryptString: vi.fn(), decryptString: vi.fn()
    }
    expect(await credentialEncryption(storage, () => false, 'darwin').isAvailable()).toBe(false)
    expect(storage.isEncryptionAvailable).not.toHaveBeenCalled()
    expect(await credentialEncryption(storage, () => true, 'darwin').isAvailable()).toBe(false)
  })
})
