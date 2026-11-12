# Validation status

Updated 2026-11-12 from Linux automated checks, GitHub CI and owner-reported
manual macOS validation. No new application tests were run for this documentation revision.

| Check | Result |
| --- | --- |
| TypeScript checks | Passed |
| ESLint | Passed |
| Mocked integration/security tests | 16 passed |
| Official local SDK compilation | Passed |
| Main/preload/renderer production build | Passed |
| Built Electron smoke | Passed: rendering, editable draft, isolated renderer, narrow validated IPC, denied popup, blocked Linux basic_text sign-in |
| Electron development mode | Passed: disclosure, prompt editing, status refresh and IPC, no page errors |
| Pinned upstream source/license/notices | 20 files verified unchanged |
| Production npm audit | No known vulnerabilities reported |
| GitHub Linux/macOS CI | Ubuntu and macOS jobs passed on merged shell; [run](https://github.com/nllptr/tutor/actions/runs/43204952674) |
| macOS device launch / normal protected persistence | Owner verified launch and reuse of saved credentials after restart in [#4](https://github.com/nllptr/tutor/issues/4); no independent Keychain inspection |
| Linux protected-keyring persistence / live authentication | Unverified; insecure backend rejection tested. Live Linux authentication is no longer a gate |
| Real OAuth consent / account eligibility | Owner verified on macOS 27.0.1, Apple M3, #4 |
| Real subscription-backed completed inference | Owner verified GPT-6.1-Sol and explicit completed-response status on macOS; successful again after restart |
| Restart with real saved credentials | Owner verified on macOS without signing in again |
| Expiry/refresh, locked-Keychain and remote revocation | Remaining manual macOS checks in #5 |
| Connected desktop simulation | Agreed design only; implementation and scenario coverage tracked in #3 |
| Strict structured output | Not tested; absent from this text-stream wrapper |

Electron checks used the shared Linux display and isolated temporary userData.
This container requires test-only Chromium sandbox flags; the application launch
scripts keep the OS sandbox enabled. Automated tests never use real credentials
or subscription inference. Passing tests does not establish macOS compatibility
or successful inference. See `manual-integration-test.md` for the remaining
real-device/account validation and `risks.md` for limitations.

## Revised gate

#3 will provide account-free automated and interactive Linux application tests
with an explicit, isolated, visibly simulated SDK substitute. The same scenarios
cover success, cancellation and failure behavior without provider traffic. #4 is
completed real macOS evidence. #5 combines this evidence with the remaining
manual macOS lifecycle checks before later development. Simulated success cannot
establish official service behavior, live Linux authentication or OS storage
security. See ADR-0005.
