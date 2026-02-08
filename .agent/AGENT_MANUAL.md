# .agent Architecture & Usage Guide

This folder contains the "brain" of your project. It transforms a standard repository into an AI-augmented workspace.
To use this in future projects, simply copy the entire `.agent` folder to the root of your new repository.

---

## 1. Core Structure

### 🧠 Skills (`.agent/skills/`)
**What:** Specialized capabilities (e.g., "Think like a Senior Architect", "Debug Systematically").
**How to use:**
- The agent automatically activates relevant skills based on your request.
- **Example:** "Create a plan for feature X" $\rightarrow$ Activates `writing-plans` skill.
- **Example:** "Debug this error" $\rightarrow$ Activates `systematic-debugging` skill.

### 📜 Rules (`.agent/rules/`)
**What:** Inviolable laws the agent must follow (e.g., "Code must be SOLID", "Speak Russian").
**How to use:**
- Edit `project-rules.md` to change constraints.
- **Critical:** If the agent hallucinates or ignores style, update this file. It's the highest priority instruction.

### 📚 Memory & Docs (`.agent/docs/`)
**What:** The project's long-term memory and context.
**How to use:**
- **Store Architecture:** Use `ARCHITECTURE_TEMPLATE.md` to describe new modules. (e.g. `docs/auth-module.md`).
- **Store Decisions:** Create `DECISIONS.md` to log why you chose Tech A over Tech B (ADR).
- **Benefit:** When a new developer (or AI) joins, they read this folder to understand *what* the system is.

### ⚙️ Workflows (`.agent/workflows/`)
**What:** Automated checklists for standard processes.
**How to use:**
- **Trigger:** Say "Run quality gate" or "Start deployment".
- **Customize:** Edit `quality-gate.md` to match your project's scripts (e.g. change `npm run lint` to `yarn lint`).
- **Create New:** Add `deploy.md` or `onboarding.md` for other repeated tasks.

### 🛠️ Scripts (`.agent/scripts/`)
**What:** Custom utilities for the agent to execute.
**How to use:**
- Place python/bash/node scripts here (e.g. `generate-component.js`).
- The agent can run these to perform complex, multi-step actions instantly.

---

## 2. Workflow Integration

### Starting a New Feature
1. **Plan:** "Create a plan for [Feature] using the @writing-plans skill."
2. **Design:** "Create an architecture doc for [Feature] in `.agent/docs/` using the template."
3. **Execute:** "Implement the plan step-by-step."
4. **Verify:** "Run quality gate."

### Debugging
1. **Analyze:** "Debug this error using @systematic-debugging."
2. **Fix:** Agent applies fix.
3. **Verify:** "Run quality gate to ensure no regressions."

---

## 3. Maintenance

- **Update Rules:** As the team grows, add rules about code review or commit message formats.
- **Add Skills:** If you find a new "best practice" (e.g. Security Auditing), create a new skill folder for it.
