# Public shadcn installation compatibility

FormMuse keeps `shadcn` 4.13.1 pinned for local development, registry
generation, and every pull-request fixture. A separate scheduled GitHub Actions
workflow runs the current public `shadcn@latest` CLI against the same generated
Hanging Gifts registry item. A new upstream CLI release therefore cannot block
an unrelated pull request, but a fresh passing scheduled run is required before
any FormMuse release or template publication.

The scheduled workflow uses a fresh Base UI Vite fixture for each documented
public invocation. It serves the generated local registry item through an
ephemeral loopback URL, installs it once, then verifies that a second run
preserves a deliberately customized adopter file and exposes the conflict. It
does not pass `--yes`, `--overwrite`, or any confirmation-suppression flag.

| Package manager | Install command                                    |
| --------------- | -------------------------------------------------- |
| pnpm            | `pnpm dlx shadcn@latest add <registry-item-url>`   |
| npm             | `npx shadcn@latest add <registry-item-url>`        |
| Yarn            | `yarn dlx shadcn@latest add <registry-item-url>`   |
| Bun             | `bunx --bun shadcn@latest add <registry-item-url>` |

## Inspecting an update before writing

Use the same command with `--diff` to inspect the prospective registry changes
without writing them. For example:

```text
pnpm dlx shadcn@latest add https://<canonical-domain>/r/<canonical-slug>.json --diff
```

Replace the prefix with `npx`, `yarn dlx`, or `bunx --bun` for the other public
command forms. `--diff` is an inspection step, not an automatic update: review
the output and resolve any adopter-owned file conflict explicitly.
