# Lighthouse laboratory environment

`pnpm quality:lighthouse` generates a fresh static artifact and invokes the lockfile-pinned Lighthouse CI command. It is a repeatable laboratory check, not a claim about field performance or conformance beyond the asserted audit categories.

## Draft and review artifacts

Every run first builds a preview artifact with `FORMMUSE_DEPLOY_ENV=preview` and the reserved origin `https://preview.formmuse.example`. Preview routes are deliberately `noindex`; their Lighthouse checks require 90 performance and 100 accessibility, best-practices, and console-error scores, but do not score SEO.

## Production artifacts

When the authored registry contains one or more `published` templates, the command additionally requires the owner-supplied, permanent `FORMMUSE_SITE_URL` and builds a production artifact against that origin. It then requires 90 performance and 100 accessibility, best-practices, SEO, and console-error scores for each indexable exported route. The permanent production origin remains an owner-controlled publication checkpoint; FormMuse does not invent one.

## Execution conditions

The CI job runs on `ubuntu-24.04` with the repository's pinned Node, pnpm, and Lighthouse CI dependencies. Lighthouse launches the runner's host Chrome, and its generated reports record the browser user agent. The audit uses a desktop 1440 by 900 viewport, sRGB color, `en-US`, and Lighthouse's provided throttling mode.

The companion `pnpm quality:links` command crawls each exported route from the same fresh artifact. There are currently no excluded internal destinations: a visible documentation reference must resolve, and a planned future destination must not be presented as a live link.

Stage 5 remains responsible for measurements of the real motion experience, mobile behavior, and user-facing performance policy.
