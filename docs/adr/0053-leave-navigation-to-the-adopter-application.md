# Leave navigation to the adopter application

FormMuse V1 Form Templates will not register `beforeunload`, install framework route blockers, intercept links or browser back/forward navigation, manipulate history to retain a visitor, or display leave-confirmation dialogs for an Ephemeral Draft. Values remain available while the form stays mounted, including across a template's own multi-step navigation, but refresh, page navigation, tab closure, and unmount end the FormMuse session without warning.

Navigation Ownership belongs to the adopter application. Public-facing contact, newsletter, and quote-request forms should not globally control whether visitors can leave a page, and FormMuse cannot know when an adopter's broader workflow genuinely justifies interruption. V1 therefore exposes no `warnOnLeave`, `isDirty`, route-blocker, or router-integration prop. Adopters may deliberately add application-level navigation protection to their owned copy.

This also avoids depending on `beforeunload`, whose dialog text is browser-controlled, whose firing is unreliable on mobile, and whose listener prevents Firefox from placing the page in its back/forward cache. Publication tests verify that templates do not claim or exercise page-level navigation control.
