# Triage labels

The Matt Pocock skills use five canonical triage roles. FormMuse keeps the default label strings.

| Role         | Label             | Meaning                                                                                                                                            |
| ------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Needs review | `needs-triage`    | A maintainer must review and classify the issue.                                                                                                   |
| Waiting      | `needs-info`      | More information is required before the issue can advance.                                                                                         |
| Autonomous   | `ready-for-agent` | The issue is sufficiently specified for autonomous implementation.                                                                                 |
| Human-owned  | `ready-for-human` | The issue requires design judgment, approval, credentials, legal review, manual testing, or another action an agent must not decide independently. |
| Rejected     | `wontfix`         | The issue will not be implemented.                                                                                                                 |

Use `triage` to review and classify issues before implementation. Never mark an issue `ready-for-agent` merely to keep work moving; unresolved owner decisions and human-only actions must remain visible.
