# Validate on submit, then on correction

Every Form Template will use submit-first Validation Timing. React Hook Form will be configured with `mode: "onSubmit"`, `reValidateMode: "onChange"`, and first-error focus enabled. No validation error is shown while a visitor initially types. The first submit attempt validates the full form and moves focus to the first invalid control; after that attempt, erroneous fields revalidate as they are edited and corrected feedback disappears promptly.

Forms will use `noValidate` to suppress inconsistent browser validation popups while keeping semantic input types and native `required` attributes where applicable. Custom controls will expose equivalent required semantics. All controls will provide `aria-invalid` and programmatic description/error associations, and shadcn controls must forward focus correctly. Zod remains the source of the visitor-facing validation messages.

For a multi-step Form Template, an intermediate submit validates only the current step and focuses its first invalid field; final submission validates the complete schema. If final cross-step validation identifies an earlier error, the template returns to the earliest affected step and focuses its first invalid field before any Submission Connection is attempted.
