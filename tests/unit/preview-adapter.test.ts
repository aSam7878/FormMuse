import { describe, expect, it, vi } from "vitest";

import {
  PREVIEW_SUBMISSION_DELAY_MS,
  parsePreviewOutcome,
  simulatePreviewSubmission,
} from "../../lib/formmuse/preview-adapter";

describe("repository-only preview adapter", () => {
  it("accepts only the exact failure selector and defaults every other value to success", () => {
    expect(parsePreviewOutcome("?outcome=failure")).toBe("failure");
    expect(parsePreviewOutcome("?outcome=success")).toBe("success");
    expect(parsePreviewOutcome("?outcome=pending")).toBe("success");
    expect(parsePreviewOutcome("?outcome=FAILURE")).toBe("success");
    expect(parsePreviewOutcome("")).toBe("success");
  });

  it("uses deterministic pending timing without a network call", async () => {
    const wait = vi.fn().mockResolvedValue(undefined);
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      simulatePreviewSubmission("success", wait),
    ).resolves.toBeUndefined();
    await expect(simulatePreviewSubmission("failure", wait)).rejects.toThrow(
      "Deterministic preview failure",
    );

    expect(wait).toHaveBeenNthCalledWith(1, PREVIEW_SUBMISSION_DELAY_MS);
    expect(wait).toHaveBeenNthCalledWith(2, PREVIEW_SUBMISSION_DELAY_MS);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
