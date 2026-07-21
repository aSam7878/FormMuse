# Keep className at the template root

Every Form Template will expose `className?: string` as a Root Class Extension applied only to its outermost rendered element. Implementations merge it after default root classes using the adopter's standard shadcn `cn` utility, so supported conflicting Tailwind utilities can intentionally change root-level placement, width, spacing, or similar concerns without discarding the template defaults.

V1 will not expose a universal `classNames` slot map, inline-style object, root `style` prop, or theme API. Deep visual changes remain edits to adopter-owned source. A narrowly named template-specific class prop requires a concrete reusable composition and documentation; it is not a route to a general styling configuration system.

This keeps the common API predictable and avoids coupling the public contract to every internal element or future refactor. Tests verify that the supplied class reaches only the outer root, defaults remain present, and intended Tailwind conflicts are resolved in adopter order.
