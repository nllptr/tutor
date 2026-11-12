import { ChatGPTError, type ChatGPTClient, type CredentialEncryption } from '@siwc/local'
import type { ConnectionStatus, ModelOption, PromptRequest, ResponseDelta, Result } from '../shared/desktop'

export function parsePrompt(value: unknown): PromptRequest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('invalid_request')
  const request = value as Record<string, unknown>
  if (Object.keys(request).sort().join(',') !== 'id,model,prompt' ||
    typeof request.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(request.id) ||
    typeof request.model !== 'string' || !request.model.trim() || request.model.length > 200 ||
    typeof request.prompt !== 'string' || !request.prompt.trim() || request.prompt.length > 20_000) {
    throw new Error('invalid_request')
  }
  return { id: request.id, model: request.model, prompt: request.prompt }
}

export async function safely<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try { return { ok: true, value: await operation() } }
  catch (error) {
    // Only the official SDK's sanitized errors cross the process boundary.
    if (error instanceof Error && error.name === 'AbortError') return { ok: false, error: { code: 'cancelled', message: 'The operation was cancelled.' } }
    if (error instanceof ChatGPTError) return { ok: false, error: { code: error.code, message: error.message } }
    return { ok: false, error: { code: 'local_error', message: 'The operation could not be completed. Retry or restart Tutor.' } }
  }
}

export function integration(client: ChatGPTClient, encryption: CredentialEncryption) {
  let active: AbortController | undefined
  let busy = false
  let models: ModelOption[] = []

  async function status(): Promise<ConnectionStatus> {
    const storageAvailable = await encryption.isAvailable()
    const session = await client.getSession()
    return {
      state: storageAvailable ? session.status : 'unavailable',
      sharing: session.sharing,
      storageAvailable,
      message: !storageAvailable
        ? 'Unlock or enable macOS Keychain or a Linux Secret Service/KWallet keyring, then refresh status. Plaintext storage is refused.'
        : session.error?.message ?? (session.status === 'connected'
          ? session.sharing ? 'Subscription permission granted. Inference is proven only by a completed real response.' : 'Identity connected; subscription permission is missing. Reconnect to grant plan usage.'
          : session.status === 'reauth_required' ? 'Sign in again to renew this connection.' : 'Connect using the system browser. An eligible ChatGPT subscription is required.')
    }
  }
  async function exclusive<T>(operation: (signal: AbortSignal) => Promise<T>): Promise<T> {
    if (busy) throw new ChatGPTError('busy', 'Finish or cancel the current operation first.')
    busy = true
    const controller = new AbortController()
    active = controller
    try { return await operation(controller.signal) }
    finally { if (active === controller) active = undefined; busy = false }
  }
  return {
    status,
    async connect() {
      return exclusive(async (signal) => {
        if (!await encryption.isAvailable()) throw new ChatGPTError('storage_unavailable', 'Protected OS credential storage is unavailable. Unlock or enable your system keyring and retry.')
        models = []
        await client.signIn({ signal, reconsent: true })
        return status()
      })
    },
    cancel() { active?.abort(); client.cancelSignIn() },
    async disconnect() {
      active?.abort()
      client.cancelSignIn()
      models = []
      await client.disconnect()
      return status()
    },
    async listModels() {
      return exclusive(async (signal) => {
        const available = await client.listModels({ signal })
        signal.throwIfAborted()
        models = available
        return models
      })
    },
    async send(request: PromptRequest, onDelta: (delta: ResponseDelta) => void) {
      return exclusive(async (signal) => {
        if (!models.some((model) => model.slug === request.model)) throw new ChatGPTError('model_unavailable', 'Refresh the available models and choose one before sending.')
        const result = await client.streamResponse({
          model: request.model,
          input: [{ role: 'user', content: request.prompt }],
          signal,
          onDelta: (text) => { if (!signal.aborted) onDelta({ id: request.id, text }) }
        })
        signal.throwIfAborted()
        return result
      })
    }
  }
}
