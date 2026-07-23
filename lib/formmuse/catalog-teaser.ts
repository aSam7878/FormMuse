export const TEASER_ADVANCE_DELAY_MS = 3200;

export type PreviewMode = "interactive" | "teaser";

export function parsePreviewMode(search: string): PreviewMode {
  return new URLSearchParams(search).get("mode") === "teaser"
    ? "teaser"
    : "interactive";
}

export function teaserPreviewSource(previewPath: string): string {
  const separator = previewPath.includes("?") ? "&" : "?";
  return `${previewPath}${separator}mode=teaser`;
}
