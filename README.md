# Tutor

An independent, local-first learning companion. Not an official OpenAI product.

This first increment is an **Electron + React + TypeScript integration spike for
Linux and macOS**: official ChatGPT subscription sign-in, model discovery, and one
cancellable streamed prompt-response request. Real account/inference success and
macOS device behavior are **not yet verified**. There is no simulated response,
API-key input, or separately billed API fallback.

## Run

Use Node.js **24 LTS**, npm, and a graphical Linux/macOS session. Linux needs the
standard Electron GTK/NSS desktop libraries and an unlocked Secret Service or
KWallet store; macOS uses Keychain. Insecure Linux `basic_text` storage is refused.

```sh
npm ci
npx install-electron --no
npm run dev
```

Electron 45 downloads its native runtime on demand. The explicit install command
makes that step visible. Tutor builds its pinned local SDK before dev/build/checks.
Read the disclosure, connect with your account in the system browser, choose a
listed model, and send a test prompt. Only the exact visible prompt is sent.
See the [manual integration checklist](docs/manual-integration-test.md) for real
account validation, cancellation, expiry, disconnect and restart checks.

```sh
npm run check       # typecheck, lint, mocked integration tests, production build
npm start           # launch built assets (run check/build first)
npm run test:smoke  # actual Electron app; requires a display, no real account
```

On headless Linux with Xvfb installed: `xvfb-run -a npm run test:smoke`.
Playwright's smoke launcher uses test-only Chromium flags; normal app commands do
not disable the OS sandbox. The Linux smoke deliberately forces the insecure
password backend and verifies Tutor blocks sign-in. Both platforms' smoke tests
use isolated temporary userData folders. CI runs checks on Ubuntu and macOS.

## Subscription status and license

[Feasibility research](docs/feasibility.md) identifies the documented subscription
route for eligible ChatGPT Plus/Pro accounts, subject to consent and service terms.
A completed real response is required to prove it works for your account. Model
listing or login alone is insufficient; partial/cancelled output is incomplete.
A missing keyring, unsupported account, rate limit, or network failure produces
visible feedback; no request is queued or silently retried.

Tutor's independently authored code is **MIT**. OpenAI's official local DevKit is
**NONCOMMERCIAL**, vendored unchanged with its license and notices at
`vendor/siwc-devkit/`, pinned to `0a36fefeb913055c8c7a1a29b63d82b96b2e841a`.
The user accepted that dependency restriction. **The combined integration is not
unrestricted MIT software.** Commercial use requires separate permission from
OpenAI. Other dependencies retain their licenses; AI Hero skills retain their
[MIT notice](docs/third-party/aihero-skills/LICENSE).

## Architecture and scope

- `src/main`: official SDK, OS credential encryption, model/stream orchestration,
  sanitized errors and validated trusted-frame IPC. No raw tokens cross IPC.
- `src/preload`: a narrow typed desktop interface with removable delta listeners.
- `src/renderer`: React UI, consent/context disclosure, drafts and partial results.
- `vendor/siwc-devkit`: pinned unmodified local SDK, built as a local dependency.
- `tests`: mocked SDK contract, cancellation, payload and credential safety checks.
- `.github/workflows/check.yml`: Linux/macOS checks and desktop smoke.

The renderer is sandboxed with context isolation, Node integration off, CSP,
denied permissions, and navigation/popups blocked. OAuth opens only the official
OpenAI origin through the trusted main process. The SDK owns PKCE, state/nonce,
identity verification, encrypted storage, refresh and revocation. Prompt/response
text is held in memory and is cleared when the window closes.

Course navigation, persistence, the study workspace, mastery rules, structured
lesson events, installers, signing and notarization are outside this increment.
Linux tests do not prove macOS runtime compatibility. Track limits in
[current risks](docs/risks.md).

The [original brief](TUTOR_PROJECT_BRIEF.md) is preserved. The confirmed
[interview decisions](docs/decisions-in-progress.md) supersede its API fallback and
initial platform scope. See the [glossary](GLOSSARY.md) and [ADRs](docs/adr/).
