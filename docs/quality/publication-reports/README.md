# Publication reports

`pnpm quality:publication-report` runs the reproducible Stage 4 automated
checks and writes one JSON report per authored template in this directory. The
report records its environment, current authored-item fingerprint, generated
registry-item fingerprint where applicable, each gate's command and result, and
the explicit blockers that keep the template in `draft`.

The command intentionally does not replace external or manual evidence. A
fresh scheduled `shadcn@latest` compatibility workflow, completed manual
accessibility evidence, branded-browser and physical-device smoke tests, and
asset/dependency licence review must be recorded before a report can become
eligible. A registry build rejects any item changed to `published` when its
current report is missing, incomplete, or does not match the current Registry
Record.

Automated browser engines and mobile emulation are labelled separately from
branded-browser and physical-device evidence. Lighthouse results are laboratory
evidence, not field data or accessibility certification.

Pull-request CI uses `pnpm quality:publication-report:ci`. It still runs and
records every gate, but automated failures are advisory while every authored
template remains `draft`. The canonical `pnpm quality:publication-report`
command stays strict, and CI becomes strict automatically as soon as any
template is `published` or `deprecated`. Registry generation independently
rejects publication without current complete evidence.
