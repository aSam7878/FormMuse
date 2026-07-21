# Use generous non-overlapping interaction targets

FormMuse will use a minimum 44 by 44 CSS-pixel Interaction Target as its quality standard for primary controls and actions. This intentionally adopts the stronger target described by WCAG 2.2 Target Size (Enhanced), rather than misrepresenting 44 pixels as the Level AA requirement. Any remaining pointer target must still satisfy the Level AA minimum of 24 by 24 CSS pixels or one of its documented exceptions.

Visible artwork may be smaller than its Interaction Target. Icon buttons will normally use a 44 by 44 wrapper, and compact checkbox or radio indicators may use their associated label or group wrapper to provide the full clickable area. Invisible expansion must not overlap or intercept an adjacent target; overlapping area does not count toward either target's usable size.

Hover is optional presentation, not an input contract. Every essential pointer action will have equivalent touch and keyboard operation using native platform conventions. Information revealed on hover will also be available through keyboard focus. Transient content triggered by hover or focus must be dismissible, hoverable, and persistent where WCAG 2.2 requires those behaviors. Important hover affordances will have an appropriate focus-visible counterpart, but receiving focus will not itself activate an action.

Publication checks will measure primary targets, verify the AA fallback for other targets, detect overlap, and exercise equivalent touch, pointer, and keyboard operation.
