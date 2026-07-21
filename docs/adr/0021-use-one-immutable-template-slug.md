# Use one immutable template slug

Every Form Template will have one lowercase kebab-case Canonical Slug used as its top-level registry `name`, `registry/base/<slug>/` source directory, `/templates/<slug>` Template Page route, `/preview/<slug>` Template Preview route, and `/r/<slug>.json` generated registry item URL. Titles, descriptions, tags, and other presentation metadata may change without changing this identity. Published Canonical Slugs will not normally be renamed; a materially new or replacement template receives a new slug and the old template is deprecated.

If an exceptional migration is unavoidable, FormMuse will preserve the old slug as a deprecated compatibility Registry Record and static documentation page with a clear replacement link. The old registry item will remain installable only when it is still safe and functional. FormMuse will not require server-side redirects because provider-specific redirect behavior would violate the host-neutral static-export policy.

Catalog search and filtering will remain client-side and may serialize state in query parameters such as `/templates?category=contact`; V1 will not generate separate category routes. Isolated preview routes will declare `noindex` so search engines prefer the canonical Template Page.
