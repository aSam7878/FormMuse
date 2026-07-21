# Keep abuse prevention behind the submission boundary

FormMuse V1 will not build a CAPTCHA provider, honeypot, rate limiter, bot score, spam filter, or anti-abuse security promise into every Form Template. Client-side Zod validation improves visitor experience but is bypassable; all values crossing the Submission Connection remain untrusted.

Adopters must validate submissions again at their trusted backend and choose rate limiting, spam prevention, monitoring, privacy, consent, retention, and downstream encoding appropriate to their service. Provider secrets must never enter a Form Template or other browser code. CAPTCHA and challenge integrations are incomplete unless the backend verifies every submitted token, so a visual widget alone will never be presented as protection.

FormMuse may later publish optional provider-specific recipes for Turnstile, reCAPTCHA, honeypots, rate limiting, and backend services. These recipes remain outside the universal API and default Template Blocks, document backend and privacy requirements, and do not change the zero-network Template Preview contract. Honeypots are treated only as an optional abuse signal, never as a security guarantee.
