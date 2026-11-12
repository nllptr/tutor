# Tutor — Product, Architecture and Implementation Brief

> **Status:** Initial project specification for Codex  
> **Date:** 2026-11-12  
> **Initial implementation:** Open-source, local-first desktop application  
> **First technical objective:** Validate an officially supported **Sign in with ChatGPT** integration that can use a user's eligible ChatGPT subscription without an API key.

## 1. Instructions for Codex

You are helping build **Tutor**, an adaptive AI-powered learning application. Read this entire brief before making architectural decisions.

**Do not implement the whole roadmap at once.** Start by inspecting the current repository (if any), researching the current official integration documentation, and producing a concise implementation plan. Then implement **Milestone 0** and **Milestone 1** in small, verifiable increments.

Key rules:

1. Treat official OpenAI documentation, terms, supported SDKs, and licensing as the source of truth. The Sign in with ChatGPT capability described below **must be verified**, not assumed. Do not invent endpoints, OAuth scopes, permissions, or entitlement behavior.
2. Never use ChatGPT web-interface automation, session-cookie extraction, reverse-engineered private endpoints, or other unofficial subscription access mechanisms.
3. Do not substitute ordinary OpenAI API billing for the subscription-based integration without explicitly identifying the difference and requesting a decision.
4. Build an honest proof of concept: a successful login alone is **not** proof that subscription-backed model inference works.
5. Prefer a small, maintainable architecture over infrastructure complexity. No Kubernetes, hosted backend, user accounts, or microservices in the initial milestones.
6. Preserve the option to support other AI providers later, but do not build a speculative provider framework before the first integration works.
7. Keep authentication secrets and tokens out of renderer code, logs, source control, and application telemetry.
8. Record assumptions and unresolved questions in `docs/decisions/` or `docs/risks.md`.
9. Use tests and linting appropriate to the scope; ensure that documented commands actually run.
10. If an official integration is unavailable or requires approval, **stop at the integration boundary**, document the blocker and viable alternatives, and leave a working application shell. Do not fake a successful connection.

## 2. Product vision

Tutor is a **general-purpose, adaptive learning companion** for self-directed study, formal courses, professional development, language learning, and other educational contexts.

Users bring their own study materials and choose what they want to learn. Tutor organizes materials into courses, connects learning goals to relevant content, teaches interactively, evaluates evidence of understanding, and adapts subsequent study sessions.

Tutor is **not**:

- A Swedish university administration system.
- A fixed-semester or credit-based planner.
- Merely a chat interface over uploaded PDFs.
- A system that equates reading or completion with mastery.
- A centrally hosted AI proxy that collects users' ChatGPT credentials.

### Product principles

- **General, not institution-specific.** No mandatory semesters, academic credits, or national grading structures.
- **Optional deadlines.** Dates may be assigned to specific activities or milestones; undated learning must work equally well.
- **Learning evidence over checkboxes.** Completion of an activity and demonstrated understanding are separate concepts.
- **User agency.** Learners can ask questions, change focus, inspect the rationale behind recommendations, and override suggested next steps.
- **Source-grounded teaching.** The tutor should distinguish what comes from supplied material, what is inference, and what is outside the material.
- **Local-first privacy.** Course documents, learning state, and credentials remain under user control by default.
- **Provider independence over time.** ChatGPT subscription support is the first target; other official APIs and local models may be added later.
- **Accessible and calm UI.** Minimal visual clutter, good keyboard support, responsive layouts, clear feedback, and restrained styling.

## 3. Initial target user and example course

Use **New Testament Greek** as the sample course because it supports objectively testable learning: identifying grammatical forms, explaining rules, and applying them to unseen sentences.

Example topics:

- Greek alphabet and transliteration.
- Nouns and grammatical cases.
- First declension.
- Present-tense verbs.

Example learning goals for the cases topic:

1. Explain the difference between nominative and accusative.
2. Identify the subject and direct object in a short sentence.
3. Recognize relevant article forms.
4. Apply the distinction to a previously unseen sentence.

These are **demo fixtures**, not mandatory product terminology or content. The application must also support arbitrary subjects.

## 4. Product information model

Distinguish these concepts explicitly:

| Concept | Purpose | Examples |
|---|---|---|
| **Course** | User-defined learning context | New Testament Greek, Photography |
| **Material** | Source document or note | PDF chapter, Markdown notes |
| **Material section** | Addressable excerpt with provenance | Chapter 2, paragraph 4 |
| **Learning goal** | Observable knowledge or skill | Identify accusative forms |
| **Activity / moment** | Work a learner can undertake | Read chapter 2, complete exercise |
| **Deadline** | Optional target date attached to an activity/milestone | Complete practice by Dec 5 |
| **Study session** | A continuous learning interaction | 20-minute tutoring session |
| **Attempt** | A learner's response to a prompt | Answer to a grammar question |
| **Observation** | Evidence-based assessment of an attempt | Correct identification, weak reasoning |
| **Knowledge state** | Current estimate of competence | Practicing, provisionally mastered |

Important: **activities and learning goals are not interchangeable**. A learner may finish an activity without mastering its learning goals, or demonstrate mastery without completing every suggested activity.

Relationships to support eventually:

- A course contains materials, activities, and learning goals.
- Materials contain addressable sections.
- Activities reference zero or more learning goals and material sections.
- Learning goals may depend on prerequisite goals.
- Attempts and observations provide evidence for goal-level knowledge states.
- Deadlines are optional; the core learning model must not depend on dates.

## 5. Agreed UI structure

The current prototype's **overall navigation and structure are accepted**. Do not redesign it during the authentication spike.

### Navigation

1. **Course library** — browse and create courses.
2. **Course overview** — progress, recommended next activity, upcoming optional deadlines.
3. **Activities / moments** — list activities, edit optional deadlines, launch study.
4. **Materials** — manage and browse study resources (may be basic in MVP).
5. **Knowledge map** — inspect goals, status, and eventually prerequisites and evidence.
6. **Study workspace** — the core learning experience.

### Study workspace

Use a **two-pane layout** on desktop:

- **Left:** Study material, with selectable passages and clear source references.
- **Right:** Tutor conversation, questions, hints, feedback, and study-session controls.

The user should be able to:

1. Open an activity and see relevant material.
2. Select a passage and ask for an explanation.
3. Start a guided exercise.
4. Respond in natural language.
5. Receive feedback and a follow-up question or hint.
6. End the session and see a concise summary, including what needs more practice.

For narrow screens, stack or switch panes accessibly. The initial UI may use fixtures and a simulated tutor, but simulated output must be labeled as such.

### UI style

- Clean, modern, restrained; no beige theme or excessive rounded corners.
- Accessible contrast and clear focus indicators.
- Good empty states and loading/error states.
- Avoid decorative complexity and dashboard overload.

## 6. Critical technical hypothesis: Sign in with ChatGPT

**Hypothesis:** An eligible user can authorize a locally running, open-source application to make model requests covered by their existing ChatGPT subscription, using an officially supported OpenAI integration and without providing a separately billed API key.

This hypothesis must be validated against **current** official documentation and by a real end-to-end test.

### Research questions to answer first

- Does the official **Sign in with ChatGPT** offering currently support subscription-backed inference for third-party applications, as opposed to identity-only login?
- Is access generally available for local open-source applications, or gated by a partner program, allowlist, registration, or other approval?
- What exact OAuth/OIDC flow, client registration method, scopes, redirect handling, and token handling are officially documented?
- Which platforms and runtime environments are supported?
- Does the official SDK support Electron/Node.js, and is there a maintained sample application?
- What are the current licensing terms for the SDK and example code? Does open-sourcing Tutor satisfy all relevant conditions? Are there noncommercial restrictions?
- What subscription tiers, model families, features, usage limits, and user-consent requirements apply?
- Is there a supported streaming interface? Are structured outputs supported?
- Where must tokens be stored, and where must inference requests originate?
- Are distribution or hosted-web restrictions relevant even when the frontend is built with web technologies?
- Can a third-party application be distributed publicly without advance approval?

### Official references to inspect (verify URLs and current content)

- https://developers.openai.com/siwc/quickstart
- https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt
- https://github.com/openai/sign-in-with-chatgpt-devkit
- https://openai.com/policies/sign-in-with-chatgpt-terms/
- https://openai.com/form/sign-in-with-chatgpt-interest/

**Do not treat the links or claims in this document as proof of current availability.** Verify that the pages and repository exist, that their guidance is current, and that the integration is officially supported for our use case. If the relevant offering has changed, update this document and explain the implications.

### Definition of a successful integration spike

All of the following must be true:

1. The user can start an official authorization flow from Tutor.
2. The user can grant consent using their own ChatGPT account.
3. Tutor receives and securely manages the documented authorization result.
4. Tutor sends a **real inference request** through the documented subscription-backed mechanism, without an API key or separate API billing.
5. The response is displayed in the app; streaming is demonstrated if supported.
6. The app handles cancellation, errors, expired credentials, and restart/reconnection behavior.
7. The implementation follows current license and distribution requirements.

If only login works, label the result **identity integration only / inference unproven**.

### Prohibited shortcuts

- Scraping or automating chatgpt.com.
- Reusing browser cookies or extracting ChatGPT session tokens.
- Calling undocumented private endpoints.
- Asking the user to paste sensitive OAuth tokens.
- Quietly falling back to separately billed API requests.
- Shipping credentials in the frontend bundle or source repository.

## 7. Initial technology choice

**Preferred starting point:**

- **Electron** for desktop application shell.
- **React + TypeScript** for the UI.
- **Node.js/TypeScript** in Electron's main process for the first integration spike.
- **SQLite** for local persistence when the data layer is introduced.
- **Local filesystem** for user-provided study documents.
- **Go** remains an option for a future pedagogical engine, but is **not required for the first spike**.

### Why Electron first?

The integration risk is more important than runtime footprint. If the official integration has a supported Node/Electron SDK or sample, Electron minimizes uncertainty. This is a **reversible choice**: keep domain logic and UI independent of Electron-specific APIs.

**Wails remains a valid alternative** if official authentication can be supported safely and maintainably in Go. Do not spend time comparing desktop frameworks until the authentication/inference path is understood.

### Security boundaries

```text
┌──────────────────────────────────────────────┐
│ Electron desktop application                 │
│                                              │
│  React renderer                              │
│  - UI, material viewer, tutor conversation   │
│  - No OAuth tokens or provider secrets       │
│              │                               │
│      Narrow, typed IPC                       │
│              ▼                               │
│  Electron main process                       │
│  - Official authentication integration       │
│  - Secure local credential handling          │
│  - AI requests and stream forwarding         │
│  - Application services                      │
│              │                               │
│        ┌─────┴───────┐                       │
│        ▼             ▼                       │
│    SQLite         Local files                │
└──────────────────────────────────────────────┘
                │
                ▼
    Official OpenAI integration
```

Electron security baseline:

- Enable `contextIsolation` and disable `nodeIntegration` in renderer windows.
- Use a narrow `contextBridge` API and validated IPC payloads.
- Apply a restrictive Content Security Policy.
- Validate external navigation, URL handling, and OAuth redirects.
- Use the system browser for authorization if the official integration recommends it.
- Use a platform-appropriate secure credential store when required/supported; do not persist secrets in plain-text SQLite.
- Treat study documents and model output as untrusted content. Do not execute document scripts or render unsanitized HTML.
- Avoid logging tokens, document contents, or personal learning data.

## 8. Pedagogical engine — design target, not first milestone

The engine should be a deterministic orchestration layer around an AI model, not a single large prompt that is trusted to manage state on its own.

### Responsibilities of application code

- Select a learning goal and relevant material.
- Track the session and its current activity.
- Store prompts, responses, assessments, and source references.
- Validate structured model outputs.
- Update knowledge states using explicit, inspectable rules.
- Decide what to practice next based on evidence, prerequisites, and optional deadlines.
- Maintain reproducible history and support re-evaluation.

### Responsibilities of the model

- Explain concepts and adapt explanations to the learner.
- Generate grounded questions and examples.
- Provide hints without prematurely revealing answers.
- Assess responses against clear criteria, including reasoning and transfer.
- Suggest follow-up questions and identify possible misconceptions.

### Teaching loop

```text
Select goal + source context
           ↓
Introduce / diagnose
           ↓
Ask a question or assign an exercise
           ↓
Learner responds
           ↓
Assess answer against criteria
           ↓
Record evidence and update state
           ↓
Hint / explain / increase difficulty / revisit prerequisite
           ↓
Repeat or summarize session
```

### Knowledge states (initial proposal)

- `not_started`
- `introduced`
- `practicing`
- `provisionally_mastered`
- `mastered`

These states should **not** be advanced solely because the learner read content or clicked a completion button. The user may explicitly override a status, but manual overrides should remain distinguishable from observed mastery.

### Example structured events

These are **application-domain event types**, not claims about OpenAI's API response schema:

```ts
type TutorEvent =
  | { type: 'question'; goalId: string; text: string; sourceSectionIds: string[] }
  | { type: 'hint'; goalId: string; text: string }
  | { type: 'feedback'; attemptId: string; text: string; outcome: 'correct' | 'partial' | 'incorrect' | 'uncertain' }
  | { type: 'learning_observation'; goalId: string; attemptId: string; evidence: string; confidence: number }
  | { type: 'session_summary'; sessionId: string; strengths: string[]; revisit: string[]; nextGoalIds: string[] };
```

Validate events at runtime; do not blindly trust generated JSON or model confidence as a calibrated probability.

### Important evaluation questions

- Does the tutor ask instead of immediately telling?
- Does it distinguish memorized recognition from genuine understanding?
- Can it check transfer to a new example?
- Can it acknowledge uncertainty rather than confidently misgrade?
- Does it cite the relevant course material accurately?
- Does a second session meaningfully adapt to previous evidence?

## 9. Milestones and acceptance criteria

### Milestone 0 — Feasibility and repository foundation

**Goal:** Establish a safe, open-source development baseline and verify the official integration path.

Tasks:

- Inspect the repository and existing conventions.
- Verify current official Sign in with ChatGPT docs, SDK, licensing, eligibility, and access requirements.
- Write `docs/feasibility.md` with source links, dates checked, supported vs. uncertain capabilities, and a go/no-go recommendation.
- Choose and document the initial Electron toolchain and package manager.
- Create a minimal Electron + React + TypeScript app if none exists.
- Add an open-source license **only after selecting an appropriate license**; recommend a common permissive license (e.g. MIT or Apache-2.0) but verify third-party compatibility. If uncertain, ask before committing a license.
- Add `README.md`, `.gitignore`, development commands, lint/typecheck, and a basic CI workflow.
- Record an architecture decision explaining why Electron is being used initially.

Acceptance:

- The application opens locally in development mode.
- Typecheck/lint/build commands run successfully.
- The feasibility document explicitly states whether subscription-backed inference is officially available for this application.
- No API keys, credentials, or undocumented authentication methods are required just to launch the shell.

### Milestone 1 — Authentication and real AI inference spike

**Goal:** Prove (or disprove) that an eligible ChatGPT subscriber can use Tutor without a separately billed API key.

Tasks:

- Implement the official supported authorization flow, **if available and permitted**.
- Provide `Connect ChatGPT`, connection status, and `Disconnect` controls.
- Keep tokens exclusively within the trusted main-process/secure-storage boundary.
- Implement one simple prompt-response request through the officially documented subscription-backed inference path.
- Display the actual response, including streaming if available.
- Handle errors, expiry, user cancellation, and application restart.
- Add a safe test strategy that does not expose credentials in CI.
- Document any account/approval requirements and usage limits.

Acceptance:

- A real, documented, subscription-backed inference request succeeds end-to-end.
- It does not require a separately billed OpenAI API key.
- Credential security and terms have been reviewed.
- Failure modes are visible and actionable.

**Stop condition:** If access is gated, unavailable, incompatible with distribution, or limited to identity login, stop and document the evidence. Present options: apply for access; keep the app shell and wait; or add an **explicitly opt-in**, separately billed API/local-model adapter. Do not silently change the business model.

### Milestone 2 — Study workspace with a real provider

**Goal:** Connect the approved UI structure to real model responses.

Tasks:

- Implement course navigation and a two-pane study workspace.
- Use a bundled short, legally usable sample text (no upload pipeline yet).
- Allow the user to select a source passage and ask about it.
- Support a short conversation and streamed responses if available.
- Keep the source material and model output visually distinct.
- Introduce a small domain-level `AIProvider` boundary based on the **proven** integration.

Acceptance:

- A learner can read a source passage, ask a question, and receive a real answer.
- No sensitive credentials are exposed to the renderer.
- UI behavior is clearly different when offline, disconnected, or rate-limited.

### Milestone 3 — Pedagogical loop

**Goal:** Complete one genuine, adaptive study session.

Tasks:

- Define 3–5 learning goals for the Greek sample topic.
- Introduce structured tutor events and validated assessment output.
- Implement question → answer → feedback → follow-up.
- Record attempts and observations in SQLite.
- Produce a session summary.
- Start a second session using prior observations.
- Add tests for state transitions and malformed model output.

Acceptance:

- The tutor can ask a question, evaluate an answer, and choose a sensible next step.
- The learner's demonstrated knowledge is stored separately from activity completion.
- The next session uses the stored evidence.

### Milestone 4 — Generalized course management

**Goal:** Make Tutor useful beyond the sample course.

Tasks:

- Create/edit courses, activities, and learning goals.
- Attach optional deadlines to activities.
- Add basic material import, initially text/Markdown or text-based PDFs.
- Link material sections to goals and activities.
- Show an evidence-aware knowledge map and recommendations.
- Add export/backup and data deletion controls.

Acceptance:

- A user can create a non-university course with no deadlines or credits.
- A user can study imported material and retain progress across app restarts.
- The knowledge map reflects observations, not merely manual checkmarks.

## 10. Non-goals for the initial spikes

Do **not** build these yet:

- Kubernetes or cloud infrastructure.
- A centrally hosted SaaS backend.
- Multi-user collaboration or synchronization.
- Payment processing or subscriptions for Tutor.
- A large RAG/vector database system.
- Multi-agent orchestration.
- Automatic generation of an entire course from arbitrary PDFs.
- Complex spaced-repetition scheduling.
- Mobile applications.
- Detailed academic-credit, term, or degree tracking.
- A fully designed marketing site.

## 11. Suggested repository organization

This is a starting point, not a rigid mandate. Adapt it to the official SDK and chosen Electron tooling.

```text
tutor/
├── README.md
├── LICENSE                         # once license choice is confirmed
├── docs/
│   ├── feasibility.md
│   ├── risks.md
│   └── decisions/
│       └── 0001-desktop-shell.md
├── src/
│   ├── main/                       # Electron main process
│   │   ├── auth/                   # official integration, token handling
│   │   ├── ai/                     # provider-specific requests
│   │   └── ipc/                    # validated handlers
│   ├── preload/                    # narrow, typed renderer bridge
│   ├── renderer/                   # React UI
│   │   ├── features/
│   │   │   ├── courses/
│   │   │   └── study/
│   │   └── components/
│   └── domain/                     # provider-agnostic domain types
├── tests/
└── .github/workflows/
```

Keep the domain and frontend independent of Electron APIs where practical. Never import Node/Electron modules into untrusted renderer components.

## 12. Testing and quality strategy

- **Unit tests:** Domain transitions, assessment mapping, source-section selection, deadline behavior.
- **Integration tests:** Typed IPC contracts and provider adapter behavior with mocked responses.
- **Manual integration test:** Official authentication and a real inference call using a developer's own eligible account.
- **Security checks:** No secrets in logs, renderer bundles, Git history, or crash reports.
- **UI checks:** Keyboard navigation, responsive workspace, loading and error states.
- **CI:** Typecheck, lint, tests, and build smoke checks without real user credentials.

Do not make networked, subscription-consuming tests mandatory in CI.

## 13. Open-source and contribution expectations

- Public repository from the beginning is acceptable.
- Prefer an understandable README with setup, scope, and clear limitations.
- Avoid committing licensed study materials or real user data.
- Include sample content that is original, appropriately licensed, or public domain.
- Document that **ChatGPT Plus and OpenAI API billing are separate products** unless the current official integration explicitly authorizes subscription-backed usage.
- Make it clear that Tutor is an independent project, not an official OpenAI product.
- Follow the actual license and distribution terms of any SDK used.

## 14. Architectural risks and decisions to track

| Risk / unknown | Why it matters | First action |
|---|---|---|
| Subscription-backed inference may be restricted | Core product promise | Verify official docs and run real spike |
| SDK licensing may restrict use | Open-source/distribution viability | Review current license and terms |
| OAuth token handling on desktop | User security | Follow documented flow and secure storage |
| Provider-specific limitations | Pedagogical engine design | Test streaming, structured output, context limits |
| LLM grading reliability | Educational correctness | Store evidence, test with known examples, allow uncertainty |
| PDF extraction quality | Source-grounded teaching | Start with short text material, add PDFs later |
| Cross-platform behavior | Distribution quality | Start on developer's OS, add other platforms incrementally |
| Scope creep into SaaS/DevOps | Delays learning validation | Keep local-first until justified |

## 15. First Codex task — copy/paste prompt

> Read `TUTOR_PROJECT_BRIEF.md` in full. We are starting Tutor, an open-source, local-first AI learning desktop app. The most important requirement is officially supported use of a user's existing ChatGPT subscription, if that is actually available. Do not assume that login implies inference access. First inspect the repository and research current official OpenAI Sign in with ChatGPT documentation, SDK availability, eligibility, terms, and licensing. Write `docs/feasibility.md` with linked evidence and a clear go/no-go conclusion. Then scaffold a minimal Electron + React + TypeScript desktop shell with safe main/preload/renderer boundaries, development scripts, lint/typecheck and a README. Do not implement unofficial authentication, scrape ChatGPT, require an API key, or begin the pedagogical engine yet. If official subscription-backed inference is supported and accessible, propose the smallest next implementation step to validate a real model request. Report what you verified, what remains uncertain, and the exact commands to run the app.

## 16. Definition of the next decision point

After Milestone 1, decide:

1. **Proceed with Electron + ChatGPT subscription integration** if it works officially and can be distributed within applicable terms.
2. **Seek approval / wait** if the official integration is gated but otherwise suitable.
3. **Offer alternative providers** only with explicit product-level acknowledgment that an API key or local model is a different experience.
4. **Reconsider Wails** only if the proven integration and maintenance tradeoffs justify it.

**Do not begin the full Tutor build until the subscription-backed inference question has a documented answer.**
