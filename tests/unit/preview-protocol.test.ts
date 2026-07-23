import { describe, expect, it, vi } from "vitest";

import {
  PREVIEW_PROTOCOL_VERSION,
  PreviewProtocolMessageSchema,
  acceptPreviewMessage,
  createPreviewMessage,
  postPreviewMessage,
  previewChannelFromSearch,
} from "../../lib/formmuse/preview-protocol";

describe("minimum Preview Protocol", () => {
  it("accepts only readiness, Reset, and Replay exact schemas", () => {
    expect(createPreviewMessage("fm-frame-1", "ready")).toEqual({
      version: PREVIEW_PROTOCOL_VERSION,
      channel: "fm-frame-1",
      direction: "frame-to-parent",
      type: "ready",
    });
    expect(createPreviewMessage("fm-frame-1", "reset").type).toBe("reset");
    expect(createPreviewMessage("fm-frame-1", "replay").type).toBe("replay");
    expect(
      PreviewProtocolMessageSchema.safeParse({
        ...createPreviewMessage("fm-frame-1", "ready"),
        height: 900,
      }).success,
    ).toBe(false);
    for (const forbidden of [
      "values",
      "content",
      "html",
      "selector",
      "url",
      "code",
      "command",
      "credentials",
      "analytics",
    ]) {
      expect(
        PreviewProtocolMessageSchema.safeParse({
          ...createPreviewMessage("fm-frame-1", "replay"),
          [forbidden]: "forbidden",
        }).success,
      ).toBe(false);
    }
  });

  it("validates expected source, exact origin, channel, and direction", () => {
    const source = {} as MessageEventSource;
    const message = createPreviewMessage("fm-frame-1", "ready");
    const expected = {
      source,
      origin: "https://formmuse.test",
      channel: "fm-frame-1",
      direction: "frame-to-parent" as const,
    };
    expect(
      acceptPreviewMessage(
        { data: message, origin: expected.origin, source },
        expected,
      ),
    ).toEqual(message);
    expect(
      acceptPreviewMessage(
        { data: message, origin: "https://evil.test", source },
        expected,
      ),
    ).toBeNull();
    expect(
      acceptPreviewMessage(
        {
          data: message,
          origin: expected.origin,
          source: {} as MessageEventSource,
        },
        expected,
      ),
    ).toBeNull();
    expect(
      acceptPreviewMessage(
        {
          data: { ...message, channel: "fm-other" },
          origin: expected.origin,
          source,
        },
        expected,
      ),
    ).toBeNull();
  });

  it("uses exact target origins and validates preview channels", () => {
    const target = { postMessage: vi.fn() };
    const message = createPreviewMessage("fm-frame-1", "reset");
    postPreviewMessage(target, message, "https://formmuse.test");
    expect(target.postMessage).toHaveBeenCalledWith(
      message,
      "https://formmuse.test",
    );
    expect(() =>
      postPreviewMessage(target, message, "https://formmuse.test/path"),
    ).toThrow("exact meaningful target origin");
    expect(previewChannelFromSearch("?channel=fm-frame-1")).toBe("fm-frame-1");
    expect(previewChannelFromSearch("?channel=bad channel")).toBeNull();
  });
});
