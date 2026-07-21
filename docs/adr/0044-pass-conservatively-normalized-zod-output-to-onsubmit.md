# Pass conservatively normalized Zod output to onSubmit

Every Form Template will pass the successful Zod schema output—not unchecked field state—to `onSubmit`. The exported public values type will use `z.output<typeof templateSchema>` and describe exactly what the Submission Connection receives.

Schema-defined normalization may trim accidental surrounding whitespace from ordinary single-line fields and perform a documented conversion when a field explicitly promises a number or another Transport Value. Numeric conversion must reject blank, non-finite, and ambiguous input rather than accidentally converting an empty string to zero. Type-changing transformations are avoided when the control can write the documented type directly.

FormMuse will not silently lowercase email addresses, restructure names or phone numbers, rewrite URLs, normalize Unicode, infer units, or reinterpret visitor content. Textareas preserve wording and line breaks, including meaningful surrounding content. A textarea schema may inspect a trimmed copy to validate that a message is not effectively empty without transforming the submitted text.

Every output-affecting transformation will be documented in structured usage notes and covered by raw-input-to-output tests. When a justified schema has distinct input and output types, React Hook Form will model both correctly while only the schema output remains the public `FormValues` contract.
