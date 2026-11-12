export const CHANNELS = {
  status: 'tutor:status', connect: 'tutor:connect', cancel: 'tutor:cancel',
  disconnect: 'tutor:disconnect', models: 'tutor:models', send: 'tutor:send',
  delta: 'tutor:delta'
} as const

export interface ConnectionStatus {
  state: 'disconnected' | 'connecting' | 'connected' | 'reauth_required' | 'unavailable'
  sharing: boolean
  storageAvailable: boolean
  message: string
}
export interface ModelOption { slug: string; displayName: string }
export interface PromptRequest { id: string; model: string; prompt: string }
export interface ResponseDelta { id: string; text: string }
export type Result<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } }

export interface TutorDesktop {
  getConnectionStatus(): Promise<Result<ConnectionStatus>>
  connect(): Promise<Result<ConnectionStatus>>
  cancel(): Promise<Result<void>>
  disconnect(): Promise<Result<ConnectionStatus>>
  listModels(): Promise<Result<ModelOption[]>>
  sendPrompt(request: PromptRequest): Promise<Result<{ text: string }>>
  onDelta(listener: (delta: ResponseDelta) => void): () => void
}
