export const TEASER_ADVANCE_DELAY_MS = 3200;

export type PreviewMode = "interactive" | "teaser";

export function parsePreviewMode(search: string): PreviewMode {
  return new URLSearchParams(search).get("mode") === "teaser"
    ? "teaser"
    : "interactive";
}

export function teaserPreviewSource(
  previewPath: string,
  previewOrigin: string,
): string {
  if (!previewPath.startsWith("/") || previewPath.startsWith("//")) {
    throw new Error("Catalog Teaser preview paths must be root-relative.");
  }
  const source = new URL(previewPath, `${previewOrigin}/`);
  if (source.origin !== previewOrigin) {
    throw new Error("Catalog Teaser preview paths cannot change origin.");
  }
  source.searchParams.set("mode", "teaser");
  return source.toString();
}
