# Preview isolation evidence

## Selected model

The owner selected a distinct preview origin on 2026-07-28. Production and
preview builds require `FORMMUSE_PREVIEW_URL` to be an HTTPS origin different
from `FORMMUSE_SITE_URL`; development uses two loopback origins. The final
`.com`, `.dev`, or `.design` hostname remains an owner-controlled Stage 6
deployment decision.

The iframe sandbox is exactly:

```text
allow-forms allow-same-origin allow-scripts
```

`allow-same-origin` preserves the preview origin for fonts and other local
static resources. It does not make the frame same-origin with the parent site.
`allow-forms` is required because Chromium and Firefox do not deliver the
template's simulated submit behavior without it. Real form navigation remains
denied separately by preview CSP.

No downloads, popups, modal dialogs, top navigation, storage access to the main
site, device capability, or other sandbox token is allowed.

## Minimum-sandbox experiment

The initial `allow-scripts` experiment used an opaque origin as required by ADR 0065. Static JavaScript, CSS, images, animation, and basic interaction loaded,
but Chromium and Firefox rejected the two local WOFF2 resources because font
fetches from origin `null` received no CORS permission. Opaque storage APIs were
also unavailable as expected. No same-origin privilege was added on the site
origin.

The approved fallback serves the same reviewed static artifact from separate
site and preview origins. Exact-origin Preview Protocol messages, fonts, form
interaction, Reset, Replay, storage isolation, and navigation-free behavior
then passed the desktop Chromium, Firefox, and WebKit projects plus Chromium
and WebKit mobile emulation. This is browser-engine and emulation evidence, not
the branded-browser or physical-device evidence reserved for Stage 5.7.

## Deployment boundary

The portable laboratory serves `out/` on ports 3100 and 3101. Stage 6 must
prove the chosen preview hostname, HTTPS, origin routing, preview-only path
exposure, and the production header mechanism on Hostinger. A build fails
closed when a non-development preview origin is absent, insecure, local, or
equal to the site origin.

## CSP and Permissions Policy

The portable dual-origin server delivers preview documents with a real HTTP
Content Security Policy header. It begins with `default-src 'none'`, permits
only same-origin scripts, styles, fonts, and media plus same-origin or `data:`
images, and blocks connections, form actions, nested frames, objects, workers,
manifests, and base URL changes. Production Next.js hydration requires inline
scripts, and the authored composition requires inline styles, so
`'unsafe-inline'` is the recorded narrow exception for those two directives.
No evaluation permission is allowed.

The CSP header repeats the sandbox so removing the iframe attribute cannot
remove the capability boundary, and `frame-ancestors` names only the configured
site origin. The response Permissions Policy and the iframe `allow` attribute
both deny accelerometer, camera, display capture, fullscreen, geolocation,
gyroscope, magnetometer, microphone, MIDI, payment, picture-in-picture,
public-key credential access, screen wake lock, serial, USB, and web share.

The portable server also refuses non-preview pages on the preview origin. The
focused integration test verifies the actual response headers and the 404
boundary. Hostinger must reproduce these exact semantics in Stage 6; this local
proof does not claim that Hostinger supports an untested configuration.
