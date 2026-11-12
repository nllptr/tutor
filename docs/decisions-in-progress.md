# Brief clarification interview

Source: `TUTOR_PROJECT_BRIEF.md`. These notes record user answers during the grill-with-docs interview; the user confirmed the direction with a platform correction: both Linux and macOS must be supported. The minimal shell and feasibility report are implemented locally; the user approved the noncommercial DevKit dependency and the official integration spike is now implemented locally, pending real account and cross-platform validation.

## Confirmed

- Official ChatGPT subscription-backed inference is mandatory; separately billed API access is a no-go. See `adr/0001-subscription-required.md`.
- Linux and macOS are both required from the first desktop shell. The agent builds and tests on Linux in this environment; the project owner tests locally on macOS. Windows is outside the initial platform scope. This supersedes the earlier macOS-only initial target.
- Send only context needed for the current tutoring interaction, with clear disclosure. See `adr/0002-local-first-provider-context.md`.

- First learner: the project owner studying New Testament Greek. First learning outcome: distinguish nominative and accusative in an unseen sentence.
- Use “activity” consistently; reserve “learning goal” for observable knowledge or skill. Activity completion does not imply mastery.
- When materials conflict, surface and cite both passages, explain possible interpretations, and do not mark an answer wrong on the disputed interpretation until clarified.

- Optional deadlines influence recommendations without forcing the study sequence. If a prerequisite gap conflicts with a deadline, recommend a short prerequisite exercise, explain the trade-off, and let the learner continue with the due activity.

- The first learning prototype reports demonstrated understanding, hint use, and uncertainty. Exact mastery thresholds and progression rules remain deliberately open until real sessions have been tried.
- Learners may challenge feedback and request source-based review. If review remains inconclusive, mark the assessment disputed, leave the previous knowledge state unchanged, and offer another example to gather evidence. Preserve the original assessment and subsequent review/correction.

## Deferred until learning trials

- Exact mastery thresholds, including the role of delayed practice. No fixed answer count or progression rule is accepted.

## Further confirmed decisions

- Tutor normally guides with questions and hints, but learners may request a full explanation or answer. Responses after the solution has been revealed count as assisted practice.
- Tutor may use broader knowledge when the supplied material is insufficient, clearly labeling it as outside the material and distinguishing generated examples from source quotations.
- Explain possible context transmission on first connection. Let learners inspect the passages and learning history included in a request without requiring confirmation for every message.

## Planning and history decisions

- For learner-supplied material, the learner describes their intended learning outcome. Tutor proposes a small set of goals and activities from selected material; the learner edits or accepts these before they become the plan. Do not automatically generate an entire course.
- A new session suggests a resumption point from prior evidence and unresolved questions; the learner can choose a different focus.
- Learners may delete a session and its assessment evidence. Recalculate affected knowledge estimates from remaining evidence and remove the deleted evidence's influence on future recommendations.

## Initial build decisions

- Saved materials, learning history, and plans remain available offline. AI interactions show an unavailable state, preserve drafts, and require explicit retry after failure; do not silently send queued messages later. Local editing and offline availability expand with the corresponding features' milestones.
- Select MIT for Tutor's own code, subject to checking compatibility with the official integration's terms. Third-party components retain their own licenses. The project license file is added for independently authored Tutor code; the DevKit is not included.
- During subscription feasibility work, build only a minimal Linux and macOS desktop shell with connection status and a prompt-response test area. Add course navigation and the study workspace after real inference is proven. This narrows the initial shell scope without redesigning the later accepted navigation.

## Next execution scope, after the interview

1. Verify current official subscription-backed integration documentation, SDK, eligibility, terms, and distribution constraints. Record linked evidence and an explicit feasibility conclusion in `docs/feasibility.md`.
2. Establish a minimal Linux- and macOS-compatible Electron + React + TypeScript shell with safe process boundaries, development commands, checks, README, CI, and the selected license after compatibility review.
3. If permitted and accessible, implement the smallest official authorization and real subscription-backed prompt-response spike. Login alone does not establish inference success. Build and runtime checks run on Linux here. The learner verifies macOS launch, official authorization, credential storage, and real inference locally; Linux results do not establish macOS runtime success. Use platform-appropriate credential storage on both platforms and report any unverified behavior explicitly.
4. If unavailable or gated, document the blocker and pause AI integration with a working shell. Separately billed API access remains excluded.
5. Once real inference is proven, proceed to the study workspace and evidence-first learning prototype in small increments. Later product decisions recorded above do not expand the initial build scope.

## Confirmation status

- Q1–Q20 have been answered. Q7's fixed mastery policy was explicitly deferred through Q10; Q8's tentative assessment-challenge policy was resolved through Q11.
- The user accepted the shared direction with the platform correction above. Proceed with feasibility research and the minimal dual-platform shell; later product milestones remain outside the initial execution scope.




## Integration licensing follow-up

- Research found an official subscription-backed route and an OpenAI DevKit under a noncommercial custom license.
- The user asked whether the DevKit is the ChatGPT integration helper. Clarified that it provides the official sign-in, credential handling, model discovery and streaming implementation; its license is separate from Tutor's MIT code.
- The user explicitly approved the noncommercial DevKit dependency. Its pinned, unmodified local package is now included with its original license/notices, separate from Tutor MIT code. No real account login or inference is claimed.
