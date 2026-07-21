# Mark optional fields and keep requirements consistent

Every Form Template will minimize required data, state “All fields are required unless marked optional.” immediately before the form, and visibly append “(optional)” to each optional field label. The instruction will have an instance-unique ID and be associated with the form where practical. FormMuse will not rely on color, placeholders, styling, or unexplained asterisks to communicate requirements.

Required semantic inputs, textareas, and selects will use native `required` without redundant `aria-required`. Required custom or composite Base UI controls that cannot express native required semantics will apply `aria-required="true"` to the appropriate control or group role, while Zod continues to enforce behavior. ARIA alone does not make a control required.

Visible wording, native or ARIA semantics, Zod validation, complete defaults, empty Transport Values, and multi-step validation must agree. Optional fields accept their documented empty representation, and required fields reject it. Checkbox and radio group instructions will describe the actual rule rather than incorrectly marking every item required.

Publication tests will compare all layers and fail any mismatch. This policy provides predictable instructions without filling every label with redundant requirement text.
