# Performance regression budgets

These owner-approved Stage 5 budgets are regression ceilings, not performance
targets and not field data. The source measurements are the pinned three-run
laboratory medians and ranges in `hanging-gifts-contact.md`; the enforceable
values live in `budgets.json`.

## Approved ceilings

| Responsibility                        |           Budget |
| ------------------------------------- | ---------------: |
| Site shell total response bodies      |  1,400,000 bytes |
| Site shell JavaScript                 |    950,000 bytes |
| Full preview total response bodies    |  1,850,000 bytes |
| Full preview JavaScript               |  1,400,000 bytes |
| Full preview images                   |    185,000 bytes |
| Incremental preview JavaScript        |    835,000 bytes |
| Desktop tasks at or above 50 ms       |                0 |
| Mobile tasks at or above 50 ms        |                2 |
| Mobile longest task                   |           100 ms |
| Mobile long-task total                |           160 ms |
| Desktop preview heap                  | 12,000,000 bytes |
| Mobile preview heap                   | 36,000,000 bytes |
| One active teaser heap                | 10,000,000 bytes |
| Twenty inactive preview JavaScript    |          0 bytes |
| Twenty inactive total response bodies |    120,000 bytes |
| Three active total response bodies    |  5,500,000 bytes |
| Three active JavaScript               |  4,200,000 bytes |
| Three active heap                     | 15,000,000 bytes |
| Simultaneously mounted teasers        |                3 |

Visited teasers unmount after leaving the active neighborhood. The policy does
not add pause/resume messages to the Preview Protocol.

The ceilings preserve explicit headroom over the Stage 5.1 measurements while
making the observed failure shape—retaining eight complete off-screen
previews—unacceptable. Site-shell limits are responsibility boundaries for
future pages, not a claim that the test-only catalog harness is a public route.

## Change control

An intentional budget change requires all of the following:

1. A fresh report containing at least three runs for every affected scenario.
2. A written comparison with the accepted baseline and an explanation of the
   product or technical value of the regression.
3. Explicit project-owner approval before the policy file changes.

A failed budget is not repaired by silently replacing the baseline. Investigate
the responsible site-shell, shared-preview, or template-specific bytes and work
first; then either remove the regression or use this review process.

No new LCP number is established here. The existing Lighthouse laboratory gate
continues to apply, and field Core Web Vitals remain post-launch evidence.
