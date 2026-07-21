# Bound every free-text field by intent

Every visitor-authored free-text field in a Published Template will have an intent-appropriate maximum length. The same numeric limit will be enforced by its Zod schema and native `maxLength` attribute. FormMuse will not apply one global value to fields with different purposes.

Longer messages and briefs may show a visible character counter when the limit materially affects writing. The counter will have an instance-unique ID and be associated with its field through `aria-describedby` together with applicable hints and errors. It will not be an `aria-live` region or announce every keystroke. Any spoken warning will occur only at a meaningful threshold transition and will not repeat unnecessarily. Short fields will normally rely on their constraint and validation message without a counter.

Publication tests will exercise every limit and one unit beyond it through both schema and rendered control, verify defaults, verify counter associations, and check that counters are not chatty. These client-side limits improve experience and define Parsed Values; adopters still enforce corresponding limits on their trusted backend.
