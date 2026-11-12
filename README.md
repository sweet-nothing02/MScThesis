# Grading the Grader: Evaluating the Validity of RAG-Based Socratic AI in Assessing Student Understanding

> **MSc Research Project & Interactive Assessment Platform**  
> Investigating the construct validity, reliability, and pedagogical telemetry of conversational AI evaluators in undergraduate computing education.

---

## 📌 Motivation & Research Context

In large-scale university programming courses, instructors rarely have the resources to probe each student's qualitative reasoning individually, while traditional automated unit tests often capture only the final output rather than the underlying problem-solving process.

As Large Language Models (LLMs) are integrated into higher education, institutions are exploring conversational agents that evaluate student reasoning directly through open-ended, Socratic dialogue. However, a foundational question remains: **How validly and reliably can AI-mediated assessments measure authentic student understanding?**

This project designs, deploys, and audits a lightweight, Retrieval-Augmented Generation (RAG) Socratic assessment platform within an undergraduate C programming curriculum. Key research directions include:

1. **Construct Validity (Convergent Agreement)**: How closely the AI's automated rubric scores (0–3 scale across _Conceptual Correctness_, _Depth of Reasoning_, and _Debugging Insight_) align with:
   - Independent expert human evaluations of the transcripts.
   - Objective compilation traces and test-run performance.
   - Subsequent course exam grades.
   - Student self-assessments via the questionnaire after the task completion.
2. **Qualitative Divergence Analysis**: Characterizing systemic patterns where the AI evaluator diverges from human experts or test metrics (e.g., syntax stumbling blocks vs. deep conceptual gaps, technostress, or dialogue misalignment).
3. **Interleaved Problem-Solving Telemetry**: Synchronizing chronological dialogue turns with fine-grained program state snapshots (code versioning, GCC compiler diagnostics, unit test executions, and countdown timers) into a unified learning analytics record.

---

## 🚀 System Architecture & Key Features

- **HackerRank-Style Assessment Workspace**:
  - Dual-pane layout featuring real-time problem specifications, constraints, function signatures, and sample cases.
  - Embedded **CodeMirror 6** editor with C/C++ syntax highlighting, line numbering, and dark mode.
  - Dedicated interactive console showing test case breakdowns (passed/failed assertions) and raw GCC compiler diagnostics.
- **Socratic Conversational Tutor**:
  - Scaffolds inquiry and probes reasoning without leaking direct code implementations.
  - Real-time streaming responses with syntax-highlighted code blocks, Markdown formatting, and collapsible reasoning/thinking traces (`<think>...</think>`).
- **Cloud-Sandboxed Code Execution**:
  - Automated C compilation and execution powered by the **Judge0 API** (GCC 9.2.0) with Base64 encoding.
  - Server-side test runner harnesses that isolate student code from hidden assertions.
- **Research Ethics & GDPR Compliance**:
  - Pseudonymized student authentication using Hungarian university **Neptun codes**.
  - Explicit, revocable GDPR consent gate prior to task commencement.
  - Salted pseudonym mapping to decouple personal student identities from telemetry datasets.
- **Telemetry & State Logging**:
  - Every test run event captures the exact code snapshot, compiler output, test pass/fail breakdown, and latest message ID for temporal alignment.

---

## 🛠️ Technology Stack

| Layer                         | Technologies                                                                                                                                                    |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Framework**        | [Nuxt 4](https://nuxt.com/) (Vue 3, Vite)                                                                                                                       |
| **UI Components & Styling**   | [@nuxt/ui v4](https://ui.nuxt.com/), [Tailwind CSS v4](https://tailwindcss.com/), Iconify                                                                       |
| **Code Editor**               | [CodeMirror 6](https://codemirror.net/) (`vue-codemirror`, `@codemirror/lang-cpp`, `@codemirror/theme-one-dark`)                                                |
| **AI Orchestration & LLMs**   | [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/vue`), Google Gemini API (`@ai-sdk/google`), OpenAI (`@ai-sdk/openai`), Anthropic (`@ai-sdk/anthropic`) |
| **Code Compilation Engine**   | [Judge0 CE API](https://judge0.com/) (C GCC 9.2.0)                                                                                                              |
| **Database & ORM**            | [NuxtHub SQLite](https://hub.nuxt.com/) (local dev) / [Turso Cloud](https://turso.tech/) (production libSQL), [Drizzle ORM](https://orm.drizzle.team/)          |
| **Authentication & Security** | `nuxt-auth-utils` (session-based Neptun login) & `nuxt-csurf` (CSRF protection)                                                                                 |

---

## ⚙️ Project Status & Deployment Roadmap

> [!NOTE]
> **Current Status: Local Development Environment**  
> The system is currently running and validated in a local development environment with local SQLite storage and connected Judge0 compilation endpoints.

### Upcoming Milestones:

1. **Cloud Deployment (Vercel + Turso)**:
   - Deployment to **Vercel Pro** with serverless function timeout optimization.
   - Remote database migration to a managed **Turso Cloud** (libSQL) instance.
2. **Pilot Data Collection (December 8)**:
   - A 60-minute fill-in C programming task administered to a cohort of 30–35 undergraduate students.
3. **Post-Study Dissemination & Open Data**:
   - Comprehensive quantitative and qualitative evaluation in the master's thesis.
   - Academic publication submission to computing education / learning analytics conferences.
   - Anonymized research dataset, statistical summaries, and an interactive public analytics dashboard will be published following the study conclusion.

---

---

## 📄 License & Attribution

This project is developed as part of an MSc thesis in Computer Science. The study is approved by the Research Ethical Committee of Eötvös Loránd University, Budapest. The paper will be available in early 2027.
