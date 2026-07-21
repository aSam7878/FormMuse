# Preserve semantic field identity and autofill

Every Form Template field will have a stable ID unique to the rendered form instance, generated with React `useId()` or an equivalent instance-specific prefix rather than a hardcoded template-wide value. Each control will have an associated visible label and meaningful form `name`, semantic `type`, appropriate `inputMode`, and applicable `autoComplete` token. This allows multiple copies of one Form Template to coexist without breaking labels, descriptions, errors, or browser autofill.

FormMuse will not disable autocomplete across a form. Phone controls will use `type="tel"`, not `number`; numeric text whose leading zeros matter will remain text with `inputMode="numeric"`. Placeholders may provide optional examples or hints but will never replace labels. Compatibility and browser tests will cover autofill behavior, floating labels, validation styling, animation, and multiple instances of the same template.
