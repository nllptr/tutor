# Subscription-backed OpenAI feasibility for Tutor

Verified 2026-11-12 (UTC). Scope: local-first Electron/React/TypeScript Tutor on Linux and macOS; independently authored Tutor code proposed under MIT; separately billed API usage is outside scope.

## Decision

**Conditional go for the minimal local shell and subsequent official-flow prototype; not yet go for a working subscription-backed release.** OpenAI now documents an official third-party ChatGPT-plan inference path for open-source/local applications. It is not necessary to substitute an API key or undocumented ChatGPT endpoint. Actual account eligibility, consent, model access, Linux credential storage and structured lesson output remain untested release gates. [Quickstart](https://developers.openai.com/siwc/quickstart), [open-source overview](https://developers.openai.com/siwc/token-sharing-open-source).

**Licensing is a material boundary:** the official DevKit is under a custom noncommercial license, not MIT. Tutor may keep independently authored code MIT, but must not relabel copied DevKit code MIT or imply the whole distributed bundle is unrestricted MIT. Decide the dependency/distribution approach before importing implementation code. [DevKit license](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/LICENSE).

## What was actually observed

All five requested URLs returned readable public content through the web tool on the verification date:

| Source | Observed evidence |
| --- | --- |
| [Quickstart](https://developers.openai.com/siwc/quickstart) | Separate identity and plan-usage capabilities; eligible Plus/Pro accounts; open-source flow without client secret or partner API key. |
| [Cookbook](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt) | Official Electron/React example; local main process owns tokens and requests. |
| [DevKit repository](https://github.com/openai/sign-in-with-chatgpt-devkit) | Public source clone succeeded; inspected commit `0a36fefeb913055c8c7a1a29b63d82b96b2e841a`. |
| [SIWC terms](https://openai.com/policies/sign-in-with-chatgpt-terms/) | Effective November 4, 2026; governs supported sign-in and plan usage. |
| [Interest form](https://openai.com/form/sign-in-with-chatgpt-interest/) | Commercial partner route; directs open-source developers to documentation. |

This establishes documented availability and public source access, **not access for this user or Tutor**. No credentials were requested, no OAuth registration was attempted, no authenticated model catalog was fetched, and no inference or OS integration was tested. Inaccessibility of a future page or endpoint would not establish that the feature does not exist.

## Eligibility, usage and distribution

The cookbook describes launch availability for open-source projects, locally run personal projects and selected private apps. The quickstart describes commercial identity integration as a limited trial. Eligible Plus/Pro users authorize plan usage separately; identity alone does not authorize inference or expose ChatGPT conversation history. Do not promise support for every subscription or workspace. [Cookbook](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt), [quickstart](https://developers.openai.com/siwc/quickstart).

The terms require the app's own identity, supported authorization, local user-controlled persistent token storage, requests for the authenticated user's own activity, and express consent for background use. Plan use must be available without paying the app developer. No pooling, resale, account rotation or general-purpose proxy for unrelated tools. Tutor's local free application shape fits these requirements in principle; that is an architectural assessment, not OpenAI approval. [Terms §§1–3.1](https://openai.com/policies/sign-in-with-chatgpt-terms/).

The DevKit license permits noncommercial use and redistribution with its license/notices and requires distributed modifications to use the same license. Its definition excludes development for a business's commercial advantage even if no fee is charged; commercial use needs a separate written agreement. Independently authored software does not become a modified work merely by interfacing with it. Separate fonts/dependencies and branding have their own terms. This supports separate Tutor licensing, not relicensing the SDK. [License §§1–5](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/LICENSE), [third-party notices](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/THIRD_PARTY_NOTICES.md). Paid or remotely hosted integration should follow the [interest route](https://openai.com/form/sign-in-with-chatgpt-interest/).

## Linux and macOS

| Layer | Documented/source evidence | Remaining gate |
| --- | --- | --- |
| Local Node SDK / React UI | `@siwc/local` and `@siwc/react` are repository workspaces; local package is private, version 0.1.0, Node >=22. [Manifest](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/packages/local/package.json), [README](https://github.com/openai/sign-in-with-chatgpt-devkit#readme). | Do not assume a published npm SDK; verify packaging and compatible Electron Node runtime. |
| macOS example | Paste Perfect requires macOS 14+, Node 22.12+, Xcode tools. Its native paste helper is macOS specific. [README](https://github.com/openai/sign-in-with-chatgpt-devkit#running-the-example-paste-perfect-app-with-sign-in-with-chatgpt). | Tutor does not need that helper; signed macOS app and Keychain behavior require real-device checks. |
| Linux core | Browser launcher uses `xdg-open`; Electron adapter explicitly permits supported Linux keyrings and rejects `basic_text`. This is portability evidence, not a Linux support guarantee. [OAuth source](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/packages/local/src/oauth.ts), [encryption adapter](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/examples/paste-perfect/electron/credential-encryption.ts). | Verify browser callback, keyring availability/lock behavior, packaging and restart on the intended Linux desktop. |

Electron documents platform-specific storage semantics: macOS uses Keychain; Linux depends on its available secret store and `basic_text` is not protected adequately. Its current documentation deprecates the synchronous storage APIs used by the example, so match any adapter to the selected Electron version rather than blindly copying it. [Electron safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage).

## Official authentication and credential boundary

The documented OSS flow uses a stable opaque per-installation host ID, dynamic initial registration, system-browser authorization, an IPv4 loopback callback, fresh state/nonce and PKCE S256. It saves the **issued** client ID per validated account/workspace registration, verifies the ID token signature/issuer/audience/expiry/nonce, and verifies granted inference scopes. No client secret is required. These are official public-client instructions, not Codex token extraction. [Registration and sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in).

Refresh is serialized for each session; rotated credentials are replaced together. Sign-out attempts remote revocation and clears local tokens, reporting unconfirmed revocation when needed. Credentials belong in protected local main-process storage, never renderer/browser storage, logs, analytics, source control or support transcripts. Keep only narrow account/status/request interfaces across IPC. [Accounts and sessions](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions), [DevKit security](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/docs/security.md). Passwords, session cookies, another app's tokens and undocumented endpoints are excluded. [Terms §1](https://openai.com/policies/sign-in-with-chatgpt-terms/).

## Inference and structured output

The documented route is OAuth bearer access to public `api.openai.com/v1/models` and `/v1/responses`, not ChatGPT `backend-api`. Discover account-specific models; require `store:false` and `stream:true`; only accept success after `response.completed`. Streamed partial text can precede quota failure, incomplete output or interruption. [Models and inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference).

The preview requires self-contained input history; HTTP `previous_response_id` and persistent conversation storage are unavailable. Several ordinary Responses fields, hosted tools and audio/video inputs are unsupported. Tutor should own its lesson/history/context locally and explicitly build request context. [Preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations).

**Structured lesson output is unproven on this authorization route.** General Responses documentation supports JSON Schema via `text.format`, including streaming, but the SIWC-specific pages reviewed do not explicitly guarantee that capability for the selected plan/model. The inspected DevKit `StreamResponseOptions` exposes only text messages, instructions, cancellation and delta callbacks; its request builder does not expose schema formatting. Do not describe its current wrapper as a structured-output SDK. [General Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [types](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/packages/local/src/types.ts), [request implementation](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/packages/local/src/responses.ts).

Before depending on generated lesson records, verify strict schema output through the documented endpoint with an eligible account and compatible model; validate completion, refusal, schema/business rules and cancellation locally. Prompted JSON alone is not proof of schema enforcement. No undocumented fallback or separately billed API fallback is authorized.

## Next authorized boundary

Proceed with the reversible local shell and provider-neutral interfaces. Keep real sign-in/inference disabled until a deliberate official integration step settles license/distribution and obtains the user's browser consent. Then demonstrate one minimal request, streamed completion and failure recovery; verify structured output and OS credential persistence on both targets. Stop at missing official access or unsupported required functionality. The present report does not claim those gates passed.

## Implementation follow-up

The user approved the noncommercial SDK dependency. Tutor now vendors the pinned
unmodified local package under its own license and exposes official sign-in,
model discovery and cancellable text streaming through a protected main-process
interface. Tutor's independent code remains MIT. This supersedes the pending
licensing decision above, not the live-validation gates. No real authorization,
account eligibility or inference result is claimed. See
[manual checks](manual-integration-test.md) and [risks](risks.md).
