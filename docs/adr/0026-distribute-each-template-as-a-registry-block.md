# Distribute each template as a registry block

Every Form Template will be one shadcn `registry:block`, reflecting that it is a complete multi-file feature rather than a single primitive. Within the Template Block, React component files use `registry:component`, schemas and utilities use `registry:lib`, and optional template-owned custom hooks use `registry:hook`. Every distributed file receives an explicit target beneath `@components/formmuse/<canonical-slug>/`, even when its semantic file type would normally target another configured directory.

Template Blocks declare local shadcn Control Primitives through `registryDependencies` and npm packages through `dependencies`. Tests, preview wrappers and routes, examples, documentation, changelogs, and visual snapshots remain repository-only and do not appear in installable `files`.

Styling will remain local to the template wherever possible. Registry-level `css` and `cssVars` are reserved for genuinely necessary shared keyframes, utilities, or variables because they modify adopter global CSS; any use must be explicitly documented, narrowly slug-scoped, and included in Manual Installation.

Ordinary styling and simple transitions will use Tailwind CSS. Complex selectors, pseudo-elements, and keyframe animations will use an optional colocated `<canonical-slug>-form.module.css` Template Stylesheet, distributed as `registry:file` with an explicit target in the self-contained template directory and imported through a relative path. The module will contain its own `prefers-reduced-motion` behavior. Form Templates will not inject runtime `<style>` elements or use `dangerouslySetInnerHTML` to install CSS. Registry-level CSS or variables remain the final option only when genuinely global behavior is unavoidable.
