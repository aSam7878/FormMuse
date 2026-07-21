# Domain documentation

FormMuse is a single-context repository. Agents consume one root domain model and one system-wide ADR directory.

## Sources of truth

Before implementation, read the sources relevant to the work:

- `CONTEXT.md` for FormMuse vocabulary and explicitly avoided terms.
- `reference.md` for the agent-ready product and template implementation contract.
- `FormMuse Tech Stack.md` for approved technologies, exact versions, dependency ownership, excluded alternatives, and update rules.
- Relevant files under `docs/adr/` for decisions and their reasoning.

GitHub issues, implementation plans, prompts, comments, generated output, and examples do not silently override these sources.

## Consumer rules

- Use the glossary's defined terms in code, tests, issues, and documentation.
- Read only the ADRs relevant to the area being changed rather than loading every ADR without purpose.
- Surface a contradiction with an existing ADR explicitly before implementation.
- Create or revise an ADR only for a genuinely new or reopened architectural decision.
- Do not turn implementation findings, measured thresholds, or ordinary code choices into unnecessary architecture questions.
- Keep FormMuse as one application and one domain context unless the project owner explicitly reopens that decision.

When a required concept is missing from `CONTEXT.md`, first determine whether existing vocabulary already expresses it. Add a new term only when it represents a durable domain distinction.
