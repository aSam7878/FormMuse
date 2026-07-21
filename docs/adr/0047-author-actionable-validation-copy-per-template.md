# Author actionable validation copy per template

Every Form Template will own its visitor-facing Validation Copy. Messages will be short, specific, respectful, and actionable: they tell the visitor what to enter or change without blame, unexplained “invalid” wording, jokes, implementation terminology, Zod issue codes, field paths, raw error objects, or backend details.

Validation rules will be ordered by usefulness: a missing required value first, then basic type or format, then length or range, then applicable cross-field constraints. React Hook Form will use `criteriaMode: "firstError"`, and the UI will show only the highest-priority currently relevant message for each field or named group. Cross-field feedback will be attached where the visitor can act without duplicating the same message beneath several controls.

Messages will be explicitly authored in the template schema or a narrow template-owned mapping. FormMuse will not expose raw library errors or a universal validation-message prop object. Inline feedback remains programmatically associated with its control and will not create an assertive live region for every change-based correction.

Publication tests will verify exact priority, one visible message per field or group, actionable wording, accessible association, stable correction behavior, and the absence of raw Zod or backend output.
