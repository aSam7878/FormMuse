# Accessibility publication checklist

Use this checklist for each template before publication. Attach a completed
record to the relevant publication report; an unchecked or incomplete item is a
publication blocker.

`pnpm quality:accessibility` is an automated safeguard for the parent Template
Page document and its embedded preview document. Automated results do not
establish WCAG conformance or replace manual review.

| Review area                | Required evidence                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard                   | All controls are reachable and usable without a pointer; dialogs and menus support Escape where applicable.                      |
| Focus order and visibility | Tab order follows the reading order, focus remains visible, and focus moves to submission outcomes or errors appropriately.      |
| Zoom and reflow            | At 200% zoom and a 320 CSS-pixel viewport, content reflows without loss of content or operability.                               |
| Screen reader              | Labels, descriptions, required state, errors, status messages, headings, landmarks, and iframe title are announced meaningfully. |
| Touch                      | Controls are operable by touch without hover-only requirements or accidental activation.                                         |
| Reduced motion             | `prefers-reduced-motion` removes or meaningfully reduces non-essential motion without hiding content or controls.                |
| Target size                | Primary interactive targets meet the project target-size contract or document a justified exception.                             |
| Contrast                   | Text, controls, focus indicators, and submission states are checked against their required contrast ratios.                      |
| Real-device review         | A representative physical device is reviewed when the template is proposed for publication.                                      |

Record the browser, operating system, assistive technology where used, device,
tester, date, limitations, and outcome in
`docs/quality/accessibility-manual-evidence.md`. Keep laboratory browser
emulation, branded-browser checks, and physical-device evidence distinct.
