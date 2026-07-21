# Locate optional raster assets under public

A Form Template that genuinely requires raster assets will install them under `public/formmuse/<canonical-slug>/` using `registry:file` entries targeted explicitly to `~/public/formmuse/<canonical-slug>/`. Templates without raster assets will not create that directory or expose an asset-location prop.

Raster-using templates will expose `assetBaseUrl?: string`, defaulting to `/formmuse/<canonical-slug>`. The implementation will remove trailing slashes before appending filenames, allowing the adopter to supply a root-relative path, deployment subpath, or absolute CDN URL without producing duplicate separators. FormMuse Template Previews will always exercise the packaged local default and make no external asset requests; CDN use is an adopter-controlled override rather than a FormMuse preview dependency.

Raster images will use standard `<img>` elements with explicit width and height and correct meaningful or decorative accessibility attributes. The files, default URL, optional prop, and any path customization will appear in Manual Installation and the Props table and will pass both Next.js and Vite compatibility builds.

When the pinned shadcn builder cannot preserve an approved raster's binary bytes, the Template Block may instead install a standalone SVG text wrapper in the same public directory. That wrapper remains a `registry:file`, contains only the approved raster as a Base64 data URI, is referenced as a normal local image through `assetBaseUrl`, and must satisfy the integrity, deterministic-generation, size, CSP, framework, browser, locality, accessibility, and zero-external-request requirements in ADR 0029. It does not authorize Base64 in application source, styles, or markup.
