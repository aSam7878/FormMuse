# Validate the current build origin

FormMuse will use one build-time `FORMMUSE_SITE_URL` as the absolute Build Origin for registry commands, preview links, Open Graph assets, documentation links, and other absolute URLs. It will pair that value with `FORMMUSE_DEPLOY_ENV`, whose allowed values are `development`, `preview`, and `production`, because `NODE_ENV=production` cannot distinguish preview deployments from the public production deployment.

Stage 5 adds one deliberately separate `FORMMUSE_PREVIEW_URL` for isolated
static Template Preview documents. It follows the same environment and HTTPS
validation rules and must never equal `FORMMUSE_SITE_URL`. The site Build Origin
remains the sole public identity for canonical URLs, registry commands,
metadata, and documentation; the preview origin is a non-indexable execution
boundary only.

Local development may default to `http://localhost:3000`. Preview CI must supply its temporary HTTPS origin and mark the entire deployment `noindex`; preview builds will not publish temporary canonical URLs or production sitemap entries, although their CLI commands may use the preview origin for testing. Production requires FormMuse's verified permanent HTTPS domain, generates canonical links and the public sitemap, and fails when the origin is missing, insecure, or localhost.

Validation and URL construction will live in one build-only configuration module. Client-side JavaScript will not read the environment variable directly, so it does not need a `NEXT_PUBLIC_` prefix. This is build-time configuration and does not add runtime server behavior to the static export.
