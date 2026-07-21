# Define the template publication lifecycle

Every Form Template will have one of three Publication Status values: `draft`, `published`, or `deprecated`. Drafts are visible only during development and are neither publicly listed nor installable. Published templates become visible, searchable, documented, and installable only after passing the complete FormMuse quality gate.

Deprecated templates retain their stable documentation URL, changelog, clear warning, and optional reference to a recommended replacement, while leaving ordinary catalog results and featured sections. Direct installation may remain available when the deprecated source is still safe, legally redistributable, and functional. FormMuse will disable installation for a deprecated template with a critical security, licensing, or serious compatibility problem while preserving its documentation for existing adopters.

When an exceptional identity migration is unavoidable, the old Canonical Slug will remain as a deprecated compatibility record with a static Template Page that identifies and links to the replacement. FormMuse will not depend on provider-specific HTTP redirects because its static export must remain portable across hosts.
