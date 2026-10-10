# Repository working rules

- Follow `prd.md` as the product source of truth and `plan.md` as the execution sequence. Keep the technology stack within the PRD unless the user explicitly approves a change.
- Preserve the safety-first rules: safety flags override ordinary outcomes, AI output is advisory, and public receipts must not expose sensitive information.
- Update `progress.md` after every major progress milestone: when starting or completing a plan phase, when a meaningful feature or infrastructure slice is finished, when blocked, or when scope changes. Include the change, verification performed, and next step.
- Do not claim tests, deployments, or security checks passed unless they were actually run and verified.
- Never commit credentials, tokens, or other secrets.
