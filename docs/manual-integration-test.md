# Real subscription integration validation

The implementation is an integration spike, not proof of working subscription
inference. Run these checks on **Linux and macOS** with your own eligible ChatGPT
account. Never paste tokens or credentials into Tutor, GitHub, logs, or chat.
Do not use an API key. The official SDK uses the documented subscription bearer
credential internally, even though its OpenAI SDK call labels that parameter
`apiKey`; Tutor does not read an API key from a user or environment variable.

## Prerequisites and launch

- Node 24 LTS, npm, and a graphical session.
- On macOS: an unlocked Keychain. On Linux: a running/unlocked Secret Service
  (for example GNOME Keyring) or KWallet. Tutor refuses `basic_text` or unknown
  credential backends. It does not fall back to plaintext storage.
- Network access to `auth.openai.com` and `api.openai.com`, and the normal system
  browser. OAuth uses a temporary IPv4 loopback callback chosen by the SDK.
- The DevKit's noncommercial license and OpenAI SIWC service terms apply.

```sh
npm ci
npx install-electron --no
npm run check
npm run dev
```

## Authorization and first real response

1. Read the context/permission disclosure and check its box. Choose **Connect
   ChatGPT**. Verify that the system browser displays the official OpenAI consent
   flow and identifies Tutor. Complete it yourself; account eligibility is
   determined by OpenAI. Never bypass a TLS warning.
2. Confirm that Tutor reports a connected state **and subscription permission**.
   Identity-only login does not pass. The SDK discovers the account's model list;
   if needed select **Refresh models** and choose a listed model.
3. Inspect the prompt. It is the entire model context for this spike: no course
   materials, previous conversation, learning history, or hidden instructions are
   attached. Select **Send test prompt**. This may consume subscription limits.
4. Observe streamed text and the final **Real response completed in this session**
   status. Text followed by failure or cancellation is incomplete and does not
   pass. A login or successful model listing alone does not pass either.
5. Record OS/architecture, date, selected model, completion/failure category and
   observed behavior in a local note. Do not include credentials or private prompt
   content. Until actual results are recorded, inference remains unproven.

## Failure, cancellation and restart

- Begin sign-in and cancel it from Tutor. Retry explicitly and confirm a new
  authorization can start. Decline consent in the browser and verify an actionable
  error, not a connected state.
- Send a sufficiently long request, cancel it, and verify the response is labeled
  incomplete. Any retained partial text must not be presented as completed.
- Disconnect the network while sending. Verify the draft is retained, failure is
  visible, and reconnecting does not silently retry/send it. Retry manually.
- Close and reopen Tutor. Verify that encrypted registration/session data can be
  read, then refresh models and send again. No prompt history should reappear.
- Exercise expired/revoked credentials with your own test account when possible;
  verify renewal or a visible reauthentication request. Do not edit/paste tokens.
- Choose **Disconnect**. Confirm local credential removal via SDK behavior and
  that sending is disabled. If remote revocation cannot be confirmed, Tutor must
  report that explicitly; check app permissions in ChatGPT Settings yourself.
- Test a locked/unavailable keyring: Tutor must block sign-in with actionable
  feedback instead of storing credentials insecurely. Unlock and refresh status.

## Local storage and scope

On a normal installation, the SDK's files live in the `chatgpt/` subdirectory of
Electron's userData folder (normally `~/Library/Application Support/Tutor` on
macOS and `$XDG_CONFIG_HOME/Tutor` or `~/.config/Tutor` on Linux). Registration and
session state are managed by the SDK; credentials are encrypted with the OS
store. A nonsecret installation identifier is persisted separately. Disconnect
retains registration metadata but removes active credentials. No credential path
or file contents are exposed to the renderer.

Automated tests use a separate temporary userData folder, no real account, and no
networked inference. They validate behavior with mocked SDK results and verify
that the Linux insecure backend is blocked. They do not establish OAuth success,
actual secure-store persistence or eligibility. Installer packaging, signing,
notarization, structured lesson output and the study UI remain later work.
