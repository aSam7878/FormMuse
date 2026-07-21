# Pin the build toolchain to Node 24 LTS

FormMuse V1 will use Node.js 24.18.0 LTS, pnpm 11.15.1, and `@types/node` 24.13.3. The Node typings intentionally match the selected runtime major instead of following the newer Node Current line. Exact Node and pnpm versions will be shared by local development, GitHub Actions, production artifact builds, and Cloudflare preview builds through `package.json`, the pnpm lockfile, runtime-version files, and provider configuration.

Node 26 is excluded while it remains a Current release. A newer Node major becoming LTS makes it eligible for evaluation but does not authorize an automatic upgrade. Changing the runtime requires an explicit reviewed update and passing the complete install, type, lint, test, registry, static-export, preview, browser, accessibility, performance, and deployment gates.

The pnpm lockfile is the executable dependency record, and CI will use frozen installation. Package-manager or runtime drift between Cloudflare previews and GitHub production builds is a deployment failure rather than an acceptable provider difference.
