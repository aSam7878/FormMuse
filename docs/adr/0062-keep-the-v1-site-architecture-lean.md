# Keep the V1 site architecture lean

FormMuse V1 will use a small public information architecture centered on `/`, `/templates`, generated `/templates/[slug]` pages, and fixed guides for introduction, installation, the Template API, connecting a backend, customization, agent use, accessibility, and the project changelog. Public privacy, licence, trademark, and security pages will present the corresponding policies in readable website form. A concise homepage mission replaces a separate About page.

The Template API guide is the canonical documentation for the universal contract around `onSubmit`, parsed values, `defaultValues`, `className`, exported schemas and values types, submission states, duplicate-submit prevention, explicit retry, persistent success, and reset behavior. Generated Template Pages will document concrete exports, fields, props, examples, and template-specific notes without duplicating or drifting from that shared contract.

Primary navigation will contain Templates, Guides, GitHub, an accessible client-side command-style Site Search, and a theme toggle. Site Search uses build-time public template and guide data, has no required public route or runtime service, excludes preview routes, and remains optional because all content is reachable through ordinary navigation. Search text will not be sent to analytics.

Generated `/preview/[slug]` routes remain absent from navigation, normal search results, sitemap generation, canonical metadata, analytics, and indexing. FormMuse will author a custom Next.js not-found UI and verify its exported host-compatible artifact rather than treating `/404` as a canonical content route.

V1 will not add Blog, Showcase, Pricing, Pro, Community, or a separate About page. A new top-level area requires actual maintained content and a demonstrated product need; empty marketing sections would dilute the focused copy-paste catalog.
