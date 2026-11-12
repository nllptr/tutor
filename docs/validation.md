# Validation status

Checked 2026-11-12 in the Linux cloud environment.

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
| GitHub Linux/macOS CI | Configured, not run yet |
| macOS device launch / Keychain | Not tested |
| Linux protected-keyring persistence | Not tested; insecure backend rejection tested |
| Real OAuth consent / account eligibility | Not tested |
| Real subscription-backed completed inference | Not tested |
| Credential refresh, restart, remote revocation with a real account | Not tested |
| Strict structured output | Not tested; absent from this text-stream wrapper |

Electron checks used the shared Linux display and isolated temporary userData.
This container requires test-only Chromium sandbox flags; the application launch
scripts keep the OS sandbox enabled. Automated tests never use real credentials
or subscription inference. Passing tests does not establish macOS compatibility
or successful inference. See `manual-integration-test.md` for the remaining
real-device/account validation and `risks.md` for limitations.
