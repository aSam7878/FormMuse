# Ship a host-neutral static export

FormMuse will build as a fully static Next.js export whose `out/` directory contains the complete website, documentation, Template Previews, and registry files. GitHub `main` will drive production deployments and branches or pull requests will receive automatic preview deployments, but no hosting provider is part of the architecture contract. V1 will not use Server Actions, middleware, API routes, ISR, or server functions, allowing the generated site to move between Cloudflare Pages, Hostinger, Firebase Hosting, Vercel, or any other static host without changing the product architecture.

The Initial Production Host will be Hostinger Premium static hosting. This is a replaceable deployment choice, not a Hostinger API or runtime dependency. Site Analytics will likewise remain independent of the host so either service can change after traction without changing the portable export or distributed templates.

Each build will receive `FORMMUSE_DEPLOY_ENV=development|preview|production` and a validated `FORMMUSE_SITE_URL` Build Origin. Development may default to `http://localhost:3000`; preview CI supplies its temporary HTTPS origin; and production requires the verified permanent HTTPS domain and rejects a missing, insecure, or localhost value. A build-only configuration module will generate absolute URLs without exposing environment access to client components or requiring a `NEXT_PUBLIC_` variable.

Preview deployments will be `noindex`, will not publish temporary URLs as SEO canonicals, and will omit production sitemap entries, while still using their Build Origin for testable registry commands and preview links. Production builds will generate canonical metadata and the public sitemap from the permanent Build Origin.
