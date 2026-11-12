---
status: accepted
---

# Separate real macOS validation from automated Linux simulation

The owner has no Linux hardware and will not share account credentials with the
agent. Retain Linux build/runtime support and automated testing, but use the
owner's macOS device for manual real-account verification; live Linux
authentication remains explicitly unverified and is no longer a development gate.

Exercise the actual desktop UI, preload, IPC and main-process application logic
with a deterministic substitute at the existing ChatGPT SDK interface. Reuse the
same scripted scenarios for automated and interactive agent testing. Simulation
requires an explicit development/test launch, an isolated profile, visible
“Simulated ChatGPT” labeling and no real provider traffic. Never fall back to it
when a real connection fails or enable it in normal application use.

Simulated success cannot establish official service behavior or OS credential
security. Keep separate SDK/protocol tests where needed and manual macOS checks
for real authentication, protected persistence, expiry and revocation. Repurpose
#3 for agent-run simulated tests and retain #5 as the combined automated/manual
gate, with #4's completed real macOS journey as evidence. This revises the
both-platform live-verification assumption in earlier decisions and the spec.

The owner confirmed the shared understanding on 2026-11-12. This is a design
decision; implementation and successful simulated-test results are tracked in #3,
not established by accepting this ADR.
