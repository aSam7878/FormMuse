# Package complex styles as CSS Modules

Form Templates will use Tailwind CSS for ordinary styling and simple transitions. When a design requires complex selectors, pseudo-elements, or keyframe animations, it will use a colocated `<canonical-slug>-form.module.css` Template Stylesheet rather than global CSS or runtime style injection.

The Template Stylesheet will be distributed as `registry:file` with an explicit target beside the template's component and schema, imported through a relative path, and include its own `prefers-reduced-motion` behavior. Form Templates will not create runtime `<style>` elements or use `dangerouslySetInnerHTML` to inject CSS. Registry-level `css` and `cssVars` remain available only when genuinely global behavior is unavoidable, and any use must be narrowly slug-scoped and fully documented in Manual Installation.
