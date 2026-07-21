# Scope each template palette

Every Form Template will own a polished Template Palette that preserves the appearance shown in its preview after installation. Palette classes and custom properties will be scoped to the template root or its CSS Module. Template-owned components will style local shadcn Control Primitives through their public class APIs and will not modify or globally override shared `components/ui/*` files.

Because Base UI popup content can be portaled outside the template root, every template-owned portaled surface will receive the required scoped palette class or tokens directly. Select, Popover, Calendar, Command, and similar content must retain the template palette without depending on root inheritance or global selectors.

The metadata appearance value defines the behavior. A `light` or `dark` template keeps that fixed palette and declares the corresponding scoped CSS `color-scheme`. An `adaptive` template provides both palettes with Tailwind `dark:` variants and corresponding scoped color schemes. Adaptive templates consume the adopter's existing Tailwind dark-mode trigger; they do not redefine whether it uses system preference, a `.dark` class, or a data attribute.

Distributed template source will not add palette rules to `:root`, `body`, universal selectors, or a generic `.dark` selector. FormMuse will not define a universal theme object or granular color props. Adopters can customize copied, scoped variables and classes directly, while typography continues to inherit from their application.

Every declared appearance and enabled interaction state must pass the accessibility gate. Normal and error text require WCAG 2.2 AA contrast of at least 4.5:1, with 3:1 permitted for qualifying large text. Authored focus indicators and boundaries or states needed to identify enabled controls require at least 3:1 contrast against adjacent colors. Disabled controls are exempt from WCAG minimum contrast requirements, but they must remain visibly distinct and semantically disabled.
