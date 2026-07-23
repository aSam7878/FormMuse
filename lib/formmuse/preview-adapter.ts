export const previewOutcomes = ["success", "failure"] as const;
export type PreviewOutcome = (typeof previewOutcomes)[number];
export const PREVIEW_SUBMISSION_DELAY_MS = 900;

export function parsePreviewOutcome(search: string): PreviewOutcome {
  const value = new URLSearchParams(search).get("outcome");
  return value === "failure" ? "failure" : "success";
}

export async function simulatePreviewSubmission(
  outcome: PreviewOutcome,
  wait: (delay: number) => Promise<void> = (delay) =>
    new Promise((resolve) => window.setTimeout(resolve, delay)),
): Promise<void> {
  await wait(PREVIEW_SUBMISSION_DELAY_MS);

  if (outcome === "failure") {
    throw new Error("Deterministic preview failure");
  }
}
