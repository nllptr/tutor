# Current risks and validation gates

- **License:** the user accepted the noncommercial DevKit dependency. Tutor's own code is MIT; the SDK and its notices under `vendor/siwc-devkit/` retain their custom noncommercial license. Commercial use is not covered.
- **Inference unproven:** official documentation establishes the supported path and the implementation uses that SDK, but no real Tutor login, consent, model discovery or subscription request has been performed. Run `manual-integration-test.md` on both platforms. Never claim inference success from login, text deltas, or mocked tests alone.
- **Platform validation:** Linux runtime and automated checks occur here. Container-only Chromium sandbox launch flags may be needed for tests; normal app scripts retain the sandbox. macOS needs device launch, Keychain, browser callback, restart and inference checks. Configured CI has not run on GitHub yet.
- **Credential storage:** credentials remain in the main-process SDK with OS encryption. Linux basic_text and unknown backends are rejected. Actual secure-keyring persistence/lock/recovery is unverified here. Synchronous safeStorage is deprecated but retained deliberately pending async-backend/rotation validation.
- **Structured output:** strict schemas remain unverified on the subscription route. The official local wrapper exposes text streaming, not JSON Schema configuration. No pedagogical engine is implemented.
- **Distribution:** no installers, signing, notarization, or release packaging are included. Runnable build assets need the installed local SDK and its dependencies/notices.
- **Data:** no materials, learning history, database or course UI yet. Prompt/response text lives only in window memory and is never automatically retried.
