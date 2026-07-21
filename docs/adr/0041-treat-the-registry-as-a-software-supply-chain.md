# Treat the registry as a software supply chain

FormMuse visitors copy and execute source and dependencies described by its registry, so the project will apply a Security Gate to the website, build tooling, CI, authoritative registry source, generated item JSON, and every Template Block.

CI will use the committed pnpm lockfile in frozen mode. Dependencies remain minimal and receive source, maintenance, licence, install-behavior, transitive-change, and vulnerability review. GitHub's dependency graph, Dependabot alerts and reviewed security updates, dependency review, CodeQL, and secret scanning with push protection will be enabled where available. Dependency updates will not auto-merge without the full quality gate.

The production branch will require passing checks and review. CI workflows will use least-privilege permissions, pin third-party actions to reviewed immutable commits, keep secrets away from untrusted pull-request code, and avoid executing untrusted checkout code through `pull_request_target`.

Secrets, private endpoints, and credentials are prohibited from browser code, examples, metadata, registry output, previews, logs, and static export. Generated output will be scanned before deployment. Distributed templates will not use dynamic code execution, remote scripts, unsafe HTML rendering, or hidden network behavior. Registry items must be generated from validated source, diffed, and checked against Manual Installation.

Production uses HTTPS and a host-appropriate reviewed security-header baseline compatible with the portable static export and same-origin preview iframes. A root `SECURITY.md` with a private reporting path is required before public launch. Known vulnerabilities are triaged in context, and an unresolved relevant high- or critical-severity issue blocks publication or disables affected installation until remediated.

Automated tools provide evidence, not a guarantee. FormMuse will document threat assumptions, review findings, and reduce unnecessary attack surface rather than describe the project as completely secure.
