# Version product releases independently from templates

FormMuse will launch publicly with repository tag and GitHub Release `v1.0.0`. After launch, passing changes merged into `main` may deploy continuously without creating a Git tag or GitHub Release for every production deployment. GitHub Releases are reserved for meaningful product milestones, template batches, shared compatibility changes, and other notable releases.

The FormMuse repository version describes the product release and remains independent from every Template Version. Each Form Template owns its semantic version and changelog. A website, documentation, tooling, or unrelated template change must not bump every template. Repository release notes may aggregate relevant template changes but never replace the individual template changelogs.

V1 will not publish a traditional FormMuse component npm package, prerelease channel, nightly channel, or one synchronized version across all templates. The production deployment history is identified by exact commit and immutable Production Artifact even when a deployment has no repository release tag.

Every Production Artifact will contain a public, schema-versioned `/formmuse-deployment.json` generated from the validated registry and CI build inputs before the artifact passes its final checks. It records the manifest schema version, exact Git commit SHA, ISO build timestamp, deployment environment, nullable repository version for a tagged release, and a slug-to-version map for every Published Template. An untagged continuous deployment uses `null` rather than inventing a repository version.

The deployment manifest contains no credential, private environment value, local filesystem path, actor identity, or unpublished template. It is generated rather than handwritten, and its template-version map must agree exactly with registry metadata. Production rollback selects a previously retained verified artifact and manifest pair; it does not rebuild an old commit at rollback time.
