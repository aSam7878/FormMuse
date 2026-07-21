# Use Fumadocs as a headless guide content pipeline

FormMuse V1 will use `fumadocs-mdx` and `fumadocs-core` for the eight long-form general guides, their content structure, and source data used by static site search. FormMuse will build its own documentation layouts, navigation, typography, code presentation, table of contents, and command-style search interface. It will not depend on `fumadocs-ui`, its theme, layouts, providers, or global styles.

Fumadocs providers and visual CSS must not enter the minimal root layout, `(preview)` layout, `/preview/<slug>` output, registry items, compatibility fixtures, or Distributed Template Source. The headless packages are website build dependencies rather than part of an adopter's installation contract.

Template Pages remain generated from the validated registry, Distributed Template Source, and referenced type-checked examples. V1 will not create per-template MDX files or duplicate Registry Record data in guide content.

The build pipeline will combine structured guide data from Fumadocs with Published Template registry metadata into a normal static search index consumed locally by the browser. FormMuse will not implement search through an `app/api` route, runtime server, hosted search service, or database. Preview routes and draft or non-browsable deprecated records remain excluded according to the existing search policy.

General guide files will remain ordinary, portable MDX and avoid unnecessary dependence on Fumadocs-specific visual components or proprietary authoring conventions. This keeps Fumadocs replaceable as a content-processing dependency. Magic UI's use of the larger Fumadocs stack validates the underlying tooling but does not require FormMuse to adopt Magic UI's documentation theme or visual architecture.
