# Tutor — subscription-first learning companion

## Problem Statement

A self-directed learner wants to study their own material with a tutor that checks
understanding, adapts to evidence, and explains its recommendations. Ordinary chat
and completion checklists do not provide a reliable account of what the learner
understands. The learner must be able to use an eligible existing ChatGPT
subscription through an official integration, without separately billed API usage.

The first learner is the project owner studying New Testament Greek. The first
learning outcome is distinguishing nominative and accusative in unseen sentences.
The product must remain suitable for arbitrary subjects and undated study.

## Solution

Build a local-first desktop learning companion for Linux and macOS. First establish
that official subscription-backed inference works end to end, using a minimal
connection and prompt-response shell. Only after that gate passes, connect an
accepted course navigation and two-pane study workspace to a small evidence-based
teaching loop. Later generalize course and material management.

Materials and learning history are owned and persisted locally as those features
are introduced. Tutor may send relevant passages, learner messages, and relevant
history to the connected provider with clear disclosure. Local-first does not mean
on-device inference. The learner controls study focus and can inspect evidence,
challenge feedback, request explanations, and delete learning history.

## User Stories

### Immediate scope: feasibility, desktop foundation and subscription spike

1. As a learner, I want Tutor to launch on Linux and macOS, so that I can use the same application in both environments.
2. As a learner, I want the shell to launch without an API key or provider credentials, so that I can inspect it before connecting.
3. As a learner, I want an official system-browser sign-in flow identifying Tutor, so that I can authorize the intended application.
4. As a subscriber, I want inference covered by my eligible ChatGPT subscription, so that I do not need separately billed API access.
5. As a learner, I want identity-only connection distinguished from inference permission, so that login does not misleadingly imply model access.
6. As a learner, I want to see models available to my connected account, so that I can select an eligible model without guessed identifiers.
7. As a learner, I want to inspect the entire prompt before sending it, so that I know what leaves my device.
8. As a learner, I want to see actual streamed output and a clear completion result, so that I can distinguish a successful response from partial text.
9. As a learner, I want to cancel sign-in or a running request, so that I retain control over the interaction.
10. As a learner, I want drafts retained after connection failures and retries to require an explicit action, so that messages are not unexpectedly sent later.
11. As a learner, I want actionable eligibility, permission, usage-limit, network and credential errors, so that I can understand why a request failed.
12. As a learner, I want credentials stored using my operating system's protected storage, so that they are not exposed as plaintext or to the renderer.
13. As a learner, I want sign-in blocked when protected storage is unavailable, so that a missing keyring does not silently weaken security.
14. As a learner, I want reconnection after restarting the application and clear reauthentication when necessary, so that credential lifetime is handled honestly.
15. As a learner, I want to disconnect and be told if remote revocation is unconfirmed, so that I understand the remaining account permissions.
16. As a contributor, I want reproducible development commands and credential-free automated checks, so that I can verify changes without consuming a subscription.
17. As a contributor, I want Tutor's MIT code distinguished from the DevKit's noncommercial license, so that I understand reuse and distribution constraints.

### Later scope: workspace and evidence-first learning, after inference is proven

18. As a learner, I want a course library, overview, activities, materials, knowledge map and study workspace, so that I can navigate my learning context consistently.
19. As a learner, I want source material beside the tutor conversation, so that I can read and ask questions without losing the source.
20. As a learner, I want to select a passage and ask for an explanation, so that the tutor can address the relevant context.
21. As a learner, I want source references and clear distinctions between quotations, generated examples and outside knowledge, so that I can judge provenance.
22. As a learner, I want conflicting sources surfaced with citations to both passages, so that disputed interpretations do not become confident grading criteria.
23. As a learner, I want questions and hints by default and a full answer when I request it, so that I control the amount of assistance.
24. As a learner, I want helped responses recorded as assisted practice, so that they are distinguished from independent understanding.
25. As a learner, I want feedback showing what I demonstrated and what remains uncertain, so that useful evidence does not depend on premature mastery thresholds.
26. As a learner, I want activity completion separate from learning-goal understanding, so that finishing work does not falsely imply mastery.
27. As a learner, I want to challenge feedback and request source-based review, so that incorrect assessments can be corrected.
28. As a learner, I want inconclusive challenged assessments marked disputed without changing my prior knowledge state, so that unresolved grading does not lower it.
29. As a learner, I want original assessments and later corrections preserved, so that changes are explainable.
30. As a learner, I want a session summary and a suggested next focus based on prior evidence, so that later sessions build on what I have demonstrated.
31. As a learner, I want to choose a different focus from Tutor's recommendation, so that I retain agency.

### Later scope: generalized course management and local data control

32. As a learner, I want to create courses for arbitrary subjects without mandatory dates or credits, so that Tutor supports my actual learning needs.
33. As a learner, I want to describe my desired outcome and review a small proposed set of goals and activities from selected material, so that I can shape my plan before accepting it.
34. As a learner, I want to import my own supported study materials and retain source references, so that explanations and evidence remain grounded.
35. As a learner, I want optional activity deadlines to influence recommendations without forcing a sequence, so that I can balance deadlines and prerequisite gaps.
36. As a learner, I want a suggested prerequisite exercise and an explained deadline trade-off, so that I can decide whether to continue with the due activity.
37. As a learner, I want saved materials, history and plans available offline, so that provider availability does not prevent access to my local learning data.
38. As a learner, I want to inspect the passages and relevant history sent to the provider without approving each individual message, so that transparency does not disrupt every exchange.
39. As a learner, I want to delete a session and its evidence and have affected knowledge estimates recalculated, so that deleted evidence no longer influences recommendations.
40. As a learner, I want export, backup and deletion controls as persistent course management is introduced, so that my local data remains under my control.

## Implementation Decisions

- Deliver in gated increments. The immediate scope is feasibility, a minimal desktop shell, and official authorization plus one real streamed prompt-response request. Later stories are requirements for subsequent milestones, not instructions to implement the whole product now.
- Use Electron, React and TypeScript, with trusted Node-based integration in the main process, electron-vite and npm with a committed lockfile. Support Linux and macOS from the first shell; the agent verifies Linux and the owner performs local macOS validation.
- Use the officially supported ChatGPT subscription path only. If access is unavailable, gated or incompatible, document the blocker and retain a working shell. Separately billed API usage, including opt-in fallback, is excluded.
- Use the pinned, unmodified official local DevKit under its own noncommercial license and preserve its notices. The user accepted that restriction; independently authored Tutor code remains MIT. The combined distribution is not unrestricted MIT software.
- The trusted process owns authorization, identity verification, protected credential persistence, refresh, model discovery, requests and revocation. Renderer code receives only safe status, model information, response text and sanitized errors through narrow validated IPC.
- Use OS credential protection, refusing Linux basic_text or unknown backends. Preserve the renderer sandbox, context isolation, disabled Node integration, restrictive content policy and blocked external navigation/popups. The system-browser authorization URL is restricted to the official OpenAI origin.
- Treat prompts, documents and generated content as untrusted. Do not execute document scripts or render unsanitized generated HTML. Keep credentials and study content out of logs and telemetry.
- In the first spike, send exactly the visible prompt with the selected account-discovered model. Later send only relevant material and history; do not automatically upload an entire course.
- Declare success only after the official response-completed event. Cancellation, interruptions and partial output must remain visibly incomplete. Do not silently retry inference or queue messages for later transmission.
- Retain the accepted navigation for later workspace implementation. Use a desktop two-pane source/conversation layout with accessible narrow-screen behavior; do not redesign navigation during the spike.
- Keep course, material, material section, learning goal, activity, deadline, session, attempt, observation and knowledge state distinct. Deadlines are optional; activity completion is not evidence of mastery.
- Use deterministic application orchestration and runtime-validated lesson output for the later teaching loop. Introduce SQLite/local-file persistence when learning data is added, without a hosted backend or speculative provider framework.
- Record evidence, assistance and uncertainty first. Exact mastery thresholds, answer counts and delayed-practice rules are deliberately deferred until learning trials.
- When sources conflict, identify both passages and keep affected assessment uncertain. When a learner challenges an assessment, preserve the review history; an inconclusive review leaves the previous knowledge state unchanged and may offer a new example.
- Recalculate affected knowledge estimates and recommendations from remaining evidence when a learner deletes session evidence.

## Testing Decisions

**Testing boundaries confirmed by the user:** use the existing desktop UI/typed IPC interface for observable application behavior, supported by focused tests of the existing integration interface with mocked SDK responses and the credential adapter's fail-closed behavior. Do not add a new provider framework or expose private SDK internals just for tests.

- Good tests assert externally observable outcomes: the learner can connect or sees a useful blocker; only permitted requests are sent; cancellation cannot appear completed; unknown failures do not expose sensitive content. Avoid assertions tied to private implementation structure.
- Existing prior art consists of mocked integration tests and an actual Electron smoke test. Extend these rather than inventing another test layer. Contract tests cover discovered-model selection, exact prompt context, no automatic retry, incomplete output, cancellation, reauthentication/revocation feedback, payload rejection and credential-storage rejection.
- The Electron smoke checks visible rendering and draft editing, disabled sending without connection/consent/model, renderer isolation, narrow validated IPC, denied popups and the insecure Linux-storage gate. It uses an isolated test profile, without real credentials or networked inference.
- Typecheck, lint, automated tests and a production build are required checks. Run the desktop smoke on Linux and macOS in CI. Container-only test sandbox flags must never become default application launch behavior.
- A real-account manual test on both platforms is required for the immediate integration gate: system-browser consent, granted inference permission, account model discovery, a completed subscription-backed request, streaming, cancellation, visible errors, credential persistence, restart/reconnection, expiry and disconnect behavior. A mocked result, login, model list or text delta alone is insufficient.
- Later learning tests cover source selection, assistance-aware evidence, conflicting material, challenged/disputed feedback, optional deadlines, resumptions and recalculation after deletion. Confirm concrete interfaces before implementing those later milestones.
- Structured lesson output is not established by ordinary text streaming. Verify the subscription route's supported output contract and validate completion, refusal, shape and domain rules before relying on generated assessments.

## Out of Scope

For the immediate increment: course navigation implementation, material upload pipelines, the study workspace, the pedagogical engine, persistent learning data, fixed mastery thresholds, strict structured lesson output, installers, signing and notarization.

For the initial product roadmap: Windows, mobile applications, hosted SaaS infrastructure, collaboration/synchronization, payments, large vector/RAG infrastructure, multi-agent orchestration, automatic generation of an entire course from arbitrary documents, complex spaced repetition and mandatory academic terms/credits.

Unofficial ChatGPT automation, cookie/token extraction, private endpoints, pasted sensitive credentials, pooled subscription access and separately billed API fallback are excluded entirely.

## Further Notes

This spec synthesizes the original project brief, the confirmed Q1–Q20 interview
answers, the Linux/macOS correction, and the later approval of the DevKit license.
It does not reopen the product interview or retroactively imply that unverified
requirements have passed. Confirmed interview decisions supersede conflicting
options in the initial brief.

Implementation is proposed in [PR #1](https://github.com/nllptr/tutor/pull/1).
Typecheck, lint, build, 16 mocked tests, Linux production smoke and development
rendering checks passed locally. macOS device validation and real account consent,
inference, secure-store persistence, refresh and revocation remain unverified.
GitHub CI was configured; no new claim about its current remote results is made.

The immediate integration is accepted only after the real-account and platform
checks above pass, or is explicitly recorded as blocked with a working shell.
Passing that gate permits the next milestone; it does not authorize the entire
later roadmap in a single implementation step.

Status: confirmed and published as [spec issue #2](https://github.com/nllptr/tutor/issues/2)
with ready-for-agent. Testing boundaries, GitHub Issues, and default triage labels
were confirmed by the user. Agent-skills configuration is recorded in AGENTS.md
and the associated tracker/domain/label documentation. The readiness label means
eligible for scoped follow-up work, not proof of completed live validation. Later
stories remain gated and must be broken into scoped work before implementation.
