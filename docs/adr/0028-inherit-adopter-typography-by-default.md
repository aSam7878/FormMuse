# Inherit adopter typography by default

Form Templates will inherit the adopter's application font by default and remain intentionally designed with sensible common sans-serif or serif fallbacks. Typography may use ordinary Tailwind classes and locally scoped CSS variables, but a template will not globally replace the adopter's type system.

Templates and Template Previews will never fetch Google Fonts or another remote font at runtime. Bundling a font is an exceptional escape hatch permitted only when the complete visual concept genuinely depends on that typeface, its licence clearly allows redistribution, and its loading approach works in both supported Next.js and Vite React projects. Any bundled font will be scoped to and installed only with that Form Template, accompanied by clear licence and Manual Installation documentation, and included in the template's asset and compatibility checks.
