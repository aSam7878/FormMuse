# Announce submission state once

Every Form Template will provide accessible Submission Feedback without duplicate screen-reader announcements. While submission is pending, the form will set `aria-busy="true"`, disable its controls through a native `<fieldset disabled>`, and display progress text such as “Sending…”; a spinner may be decorative but cannot be the only progress indicator. A polite `role="status"` for pending progress will be rendered outside the busy form subtree because assistive technology may defer updates owned by an `aria-busy` element.

React Hook Form captures validated values before awaiting `onSubmit`, so the disabled fieldset does not change the values passed through the Submission Connection. Failure re-enables controls and preserves values, then moves focus once to a visible failure heading or summary with `tabIndex={-1}`. Success moves focus once to its designed heading after replacing the form. Focused result content will not also use `role="alert"`, `role="status"`, or another live region containing the same message.

Semantic state and focus updates will happen immediately when the promise settles. Motion may visually transition between states but will not postpone busy, disabled, error, success, or focus semantics.
