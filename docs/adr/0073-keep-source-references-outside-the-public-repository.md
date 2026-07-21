# Keep source references outside the public repository

The FormMuse application and public Git repository will live at the workspace root. The existing `website-v2/` application remains an untouched local source reference and is not part of FormMuse source, builds, tests, CI, deployment, or MIT licensing. FormMuse will deliberately adapt only original, reviewed, redistribution-safe Hanging Gifts code and assets into `registry/base/hanging-gifts-contact/`.

Workspace-only third-party skills under `.agents/`, the Cedar-specific `example tech stack.md`, and operating-system metadata such as `.DS_Store` also remain outside the public repository. Because these files exist only in the owner's working environment, they will be recorded in `.git/info/exclude` rather than advertised as project-wide generated paths in the public `.gitignore`.

FormMuse-owned architecture sources such as `CONTEXT.md`, `reference.md`, `FormMuse Tech Stack.md`, `docs/adr/`, and `docs/launch-collection.md` are public project documentation. Excluding local references does not permit copying third-party or Cedar-specific assets into MIT-covered FormMuse source without provenance and licence review.
