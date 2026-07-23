import { z } from "zod/v4";

export const PREVIEW_PROTOCOL_VERSION = 1 as const;
export const PreviewChannelSchema = z
  .string()
  .regex(/^fm-[A-Za-z0-9_-]{1,80}$/);

const ReadyMessageSchema = z.strictObject({
  version: z.literal(PREVIEW_PROTOCOL_VERSION),
  channel: PreviewChannelSchema,
  direction: z.literal("frame-to-parent"),
  type: z.literal("ready"),
});
const ResetMessageSchema = z.strictObject({
  version: z.literal(PREVIEW_PROTOCOL_VERSION),
  channel: PreviewChannelSchema,
  direction: z.literal("parent-to-frame"),
  type: z.literal("reset"),
});
const ReplayMessageSchema = z.strictObject({
  version: z.literal(PREVIEW_PROTOCOL_VERSION),
  channel: PreviewChannelSchema,
  direction: z.literal("parent-to-frame"),
  type: z.literal("replay"),
});

export const PreviewProtocolMessageSchema = z.discriminatedUnion("type", [
  ReadyMessageSchema,
  ResetMessageSchema,
  ReplayMessageSchema,
]);
export type PreviewProtocolMessage = z.output<
  typeof PreviewProtocolMessageSchema
>;

export function createPreviewMessage(
  channel: string,
  type: PreviewProtocolMessage["type"],
): PreviewProtocolMessage {
  return PreviewProtocolMessageSchema.parse({
    version: PREVIEW_PROTOCOL_VERSION,
    channel,
    direction: type === "ready" ? "frame-to-parent" : "parent-to-frame",
    type,
  });
}

export function previewChannelFromSearch(search: string): string | null {
  const result = PreviewChannelSchema.safeParse(
    new URLSearchParams(search).get("channel"),
  );
  return result.success ? result.data : null;
}

export function acceptPreviewMessage(
  event: Pick<MessageEvent<unknown>, "data" | "origin" | "source">,
  expected: Readonly<{
    source: MessageEventSource | null;
    origin: string;
    channel: string;
    direction: PreviewProtocolMessage["direction"];
  }>,
): PreviewProtocolMessage | null {
  if (
    !expected.source ||
    event.source !== expected.source ||
    event.origin !== expected.origin
  )
    return null;
  const result = PreviewProtocolMessageSchema.safeParse(event.data);
  if (
    !result.success ||
    result.data.channel !== expected.channel ||
    result.data.direction !== expected.direction
  )
    return null;
  return result.data;
}

export function postPreviewMessage(
  target: Pick<Window, "postMessage">,
  message: PreviewProtocolMessage,
  targetOrigin: string,
): void {
  const parsedOrigin = new URL(targetOrigin);
  if (parsedOrigin.origin !== targetOrigin || targetOrigin === "null") {
    throw new Error(
      "Preview Protocol requires an exact meaningful target origin.",
    );
  }
  target.postMessage(PreviewProtocolMessageSchema.parse(message), targetOrigin);
}
