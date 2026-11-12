import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { ConnectionStatus, ModelOption, Result } from '../../shared/desktop'
import './style.css'

type Phase = 'idle' | 'streaming' | 'completed' | 'incomplete'

function App() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [error, setError] = useState('')
  const [operation, setOperation] = useState('')
  const [draft, setDraft] = useState('Explain the difference between nominative and accusative.')
  const [models, setModels] = useState<ModelOption[]>([])
  const [model, setModel] = useState('')
  const [consent, setConsent] = useState(false)
  const [response, setResponse] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const requestId = useRef<string | null>(null)
  const busy = operation !== ''
  const connected = status?.state === 'connected' && status.sharing

  function unwrap<T>(result: Result<T>): T {
    if (!result.ok) throw new Error(`${result.error.message} (${result.error.code})`)
    return result.value
  }
  async function refresh() {
    const next = unwrap(await window.tutor.getConnectionStatus())
    setStatus(next)
    if (next.state !== 'connected' || !next.sharing) { setModels([]); setModel('') }
  }
  async function perform(name: string, work: () => Promise<void>) {
    setOperation(name)
    setError('')
    try { await work() }
    catch (error) { setError(error instanceof Error ? error.message : 'The operation failed. Try again.') }
    finally {
      try { await refresh() } catch { setError('Connection status could not be read. Restart Tutor to try again.') }
      setOperation('')
    }
  }
  async function loadModels() {
    const available = unwrap(await window.tutor.listModels())
    setModels(available)
    setModel((current) => available.some((option) => option.slug === current) ? current : available[0]?.slug ?? '')
    if (!available.length) setError('No models were listed for this connection. Check your account eligibility and permissions.')
  }
  useEffect(() => {
    let mounted = true
    window.tutor.getConnectionStatus().then((result) => {
      if (mounted) {
        if (result.ok) setStatus(result.value)
        else setError(result.error.message)
      }
    }).catch(() => { if (mounted) setError('Connection status could not be read. Restart Tutor to try again.') })
    const unsubscribe = window.tutor.onDelta((delta) => {
      if (delta.id === requestId.current) setResponse((text) => text + delta.text)
    })
    return () => { mounted = false; unsubscribe() }
  }, [])

  async function send() {
    const id = crypto.randomUUID()
    requestId.current = id
    setResponse('')
    setPhase('streaming')
    try {
      const result = unwrap(await window.tutor.sendPrompt({ id, model, prompt: draft }))
      setResponse(result.text)
      setPhase('completed')
    } catch (error) { setPhase('incomplete'); throw error }
    finally { requestId.current = null }
  }

  return (
    <main>
      <header><span className="eyebrow">TUTOR / INTEGRATION SPIKE</span><h1>A foundation for learning.</h1>
        <p>An independent, local-first desktop learning companion.</p></header>
      <section aria-labelledby="connection-title">
        <div className="section-heading"><h2 id="connection-title">ChatGPT connection</h2>
          <span className="badge">{operation === 'Connecting' ? 'Connecting…' : status?.state.replaceAll('_', ' ') ?? 'Checking…'}</span></div>
        <p role="status">{status?.message ?? 'Reading connection status…'}</p>
        <label className="consent"><input type="checkbox" checked={consent} disabled={busy} onChange={(event) => setConsent(event.target.checked)} />
          I understand: connecting requests ChatGPT subscription permission in my browser. Sending transmits exactly the prompt below to OpenAI using the selected model. No materials or learning history are attached.</label>
        <div className="actions">
          <button disabled={busy || !consent || !status?.storageAvailable} onClick={() => void perform('Connecting', async () => {
            setModels([]); setModel('')
            setStatus(unwrap(await window.tutor.connect()))
            await loadModels()
          })}>{status?.state === 'reauth_required' || status?.state === 'connected' ? 'Reconnect ChatGPT' : 'Connect ChatGPT'}</button>
          <button disabled={busy || !status?.storageAvailable} onClick={() => void perform('Disconnecting', async () => {
            try { setStatus(unwrap(await window.tutor.disconnect())) }
            finally { setModels([]); setModel('') }
          })}>Disconnect</button>
          <button disabled={busy} onClick={() => void perform('Refreshing status', refresh)}>Refresh status</button>
        </div>
        <p className="note">Eligible ChatGPT subscription required. No API key or separately billed API fallback. Credentials stay encrypted in this device’s protected storage.</p>
      </section>
      <section aria-labelledby="test-title">
        <h2 id="test-title">Inference test</h2>
        <label htmlFor="model">Available subscription model</label>
        <div className="actions"><select id="model" value={model} disabled={busy || !models.length} onChange={(event) => setModel(event.target.value)}>
          {!models.length && <option value="">Refresh models after connecting</option>}
          {models.map((option) => <option key={option.slug} value={option.slug}>{option.displayName}</option>)}
        </select><button disabled={busy || !connected} onClick={() => void perform('Loading models', loadModels)}>Refresh models</button></div>
        <label htmlFor="prompt">Prompt draft</label>
        <textarea id="prompt" value={draft} disabled={busy} maxLength={20_000} onChange={(event) => setDraft(event.target.value)} rows={4} />
        <p className="note">This is the entire request context. The draft and response stay in window memory and clear when the window closes. Nothing is queued for later.</p>
        <div className="actions"><button disabled={busy || !connected || !consent || !model || !draft.trim()} onClick={() => void perform('Requesting response', send)}>Send test prompt</button>
          <button disabled={!busy || operation === 'Disconnecting' || operation === 'Refreshing status'} onClick={() => {
            void window.tutor.cancel().then((result) => { if (!result.ok) setError(result.error.message) }).catch(() => setError('Cancellation could not be requested.'))
          }}>Cancel</button></div>
        <p role="status">{busy ? `${operation}…` : phase === 'completed' ? 'Real response completed in this session.' : phase === 'incomplete' ? 'Request did not complete. Any text below is partial; retry explicitly.' : 'No completed inference in this session. Sign-in alone is not proof.'}</p>
        <div className="response" aria-label="Model response">{response || 'No response text.'}</div>
      </section>
      {error && <p role="alert" className="error">{error}</p>}
      <footer>Linux + macOS · Noncommercial integration spike · Not an official OpenAI product</footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
