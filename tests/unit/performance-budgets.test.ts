import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const budgets = JSON.parse(
  readFileSync("docs/quality/performance/budgets.json", "utf8"),
);
const baseline = JSON.parse(
  readFileSync(
    "docs/quality/performance/hanging-gifts-contact.raw.json",
    "utf8",
  ),
);

describe("owner-approved performance budgets", () => {
  it("keeps the approval and change-control checkpoint machine-readable", () => {
    expect(budgets.approvedOn).toBe("2026-07-28");
    expect(budgets.laboratoryOnly).toBe(true);
    expect(budgets.changeControl).toEqual({
      freshRunsRequired: 3,
      requiresRationale: true,
      requiresOwnerApproval: true,
    });
    expect(budgets.coreWebVitals.newLcpBudget).toBe(false);
  });

  it("records the approved responsibility boundaries", () => {
    expect(budgets.budgets).toEqual({
      siteShell: {
        totalResponseBytesMax: 1_400_000,
        javascriptBytesMax: 950_000,
      },
      fullPreview: {
        totalResponseBytesMax: 1_850_000,
        javascriptBytesMax: 1_400_000,
        imageBytesMax: 185_000,
        incrementalJavascriptBytesMax: 835_000,
        desktopLongTasksAtLeast50msMax: 0,
        mobileLongTasksAtLeast50msMax: 2,
        mobileLongestTaskMsMax: 100,
        mobileLongTaskTotalMsMax: 160,
        desktopHeapBytesMax: 12_000_000,
        mobileHeapBytesMax: 36_000_000,
      },
      catalogTeasers: {
        simultaneouslyMountedMax: 3,
        activationRootMargin: "600px 0px",
        observerFallback: "inactive",
        offscreenVisitedBehavior: "unmount",
        reactivationBehavior: "remount",
        protocolExtension: "none",
        oneActiveHeapBytesMax: 10_000_000,
        twentyInactivePreviewJavascriptBytesMax: 0,
        twentyInactiveTotalResponseBytesMax: 120_000,
        threeActiveTotalResponseBytesMax: 5_500_000,
        threeActiveJavascriptBytesMax: 4_200_000,
        threeActiveHeapBytesMax: 15_000_000,
      },
    });
  });

  it("retains the accepted three-run raw evidence", () => {
    expect(baseline.methodology.repetitions).toBe(3);
    expect(baseline.scenarios).toHaveLength(30);
    expect(
      new Set(baseline.scenarios.map(({ id }: { id: string }) => id)).size,
    ).toBe(10);
  });
});
