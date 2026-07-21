# Keep the form shape in adopter-owned source

FormMuse V1 will not expose `schema`, `fields`, validation-rule, validation-message, or step-definition configuration props. Such props would turn each polished template into a generic form builder and could allow the runtime schema, TypeScript values, rendered controls, layout, accessibility relationships, animation, and step flow to disagree.

Each Form Template will instead export its clearly named Zod schema and inferred values type. Its field set, validation rules and messages, complete defaults, rendered controls, accessibility associations, animation, responsive arrangement, and optional step placement form one coordinated Form Shape in adopter-owned copied source.

Adopters and coding agents can customize that source directly. A Form Shape change must update the schema, inferred type, defaults, rendered fields, labels and errors, optional step field maps, structured metadata, examples, and relevant tests together. Validation must never require an unrendered field, and rendered submission data must remain represented by the exported values type.

The public API remains intentionally small: the universal `onSubmit`, `defaultValues`, and `className` props plus only a few justified template-specific behavior or Content Slot props.
