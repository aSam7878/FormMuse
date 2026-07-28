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
      sequence: 0,
    });
    expect(createPreviewMessage("fm-frame-1", "reset", 1).type).toBe("reset");
    expect(createPreviewMessage("fm-frame-1", "replay", 2).type).toBe("replay");
    expect(() => createPreviewMessage("fm-frame-1", "reset")).toThrow();
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
          ...createPreviewMessage("fm-frame-1", "replay", 1),
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
      afterSequence: -1,
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

  it("rejects malformed, versioned, directional, and replayed payloads", () => {
    const source = {} as MessageEventSource;
    const expected = {
      source,
      origin: "https://preview.formmuse.test",
      channel: "fm-frame-1",
      direction: "parent-to-frame" as const,
      afterSequence: 1,
    };
    const reset = createPreviewMessage("fm-frame-1", "reset", 2);
    expect(
      acceptPreviewMessage(
        { data: reset, origin: expected.origin, source },
        expected,
      ),
    ).toEqual(reset);
    for (const data of [
      null,
      "reset",
      {},
      { ...reset, version: 2 },
      { ...reset, type: "pause" },
      { ...reset, direction: "frame-to-parent" },
      { ...reset, sequence: 1 },
      { ...reset, sequence: 1.5 },
      { version: 1, channel: "fm-frame-1", type: "reset" },
    ]) {
      expect(
        acceptPreviewMessage(
          { data, origin: expected.origin, source },
          expected,
        ),
      ).toBeNull();
    }
  });

  it("uses exact target origins and validates preview channels", () => {
    const target = { postMessage: vi.fn() };
    const message = createPreviewMessage("fm-frame-1", "reset", 1);
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
