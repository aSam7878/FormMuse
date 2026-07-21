# Use category-only catalog browsing

The V1 catalog will provide exactly four browsing states: All, Contact, Newsletter, and Quote Request. The three category views use controlled query parameters on `/templates`, while All uses the canonical unfiltered route. Every view preserves the project owner's intentional `registry.json` order and includes only Published Templates.

FormMuse will not add a catalog-specific search input, sorting, result counts, active-filter chips, or filters for step count, appearance, animation, layout, fields, tags, or implementation technology in V1. With only 20 owner-curated launch templates, marketplace-style faceting adds interface weight without improving meaningful discovery. The existing Site Search may match template titles, descriptions, Primary Category, tags, and included fields when a visitor needs a more specific lookup.

All category query combinations use `/templates` as their canonical URL and will not be treated as separately indexable catalog pages. Category controls remain ordinary accessible links or progressively enhanced navigation so browsing does not depend on the command search or client-only controls. Deprecated and draft templates remain excluded from ordinary catalog views under the existing publication lifecycle.
