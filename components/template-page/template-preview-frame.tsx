"use client";

import {
  AlertCircle,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { PreviewOutcome } from "@/lib/formmuse/preview-adapter";
import {
  acceptPreviewMessage,
  createPreviewMessage,
  postPreviewMessage,
} from "@/lib/formmuse/preview-protocol";
import { cn } from "@/lib/utils";

const viewports = [
  { id: "desktop", label: "Desktop", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
] as const;

type ViewportId = (typeof viewports)[number]["id"];
type FrameState = "loading" | "ready" | "error";

export function TemplatePreviewFrame({
  previewPath,
}: Readonly<{ previewPath: string | null }>) {
  const [viewport, setViewport] = useState<ViewportId>("desktop");
  const [outcome, setOutcome] = useState<PreviewOutcome>("success");
  const [resetKey, setResetKey] = useState(0);
  const [replayRequest, setReplayRequest] = useState(0);
  const [frameState, setFrameState] = useState<FrameState>("loading");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const id = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const channel = `fm-${id || "preview"}-${resetKey}`;
  const selectedViewport =
    viewports.find((candidate) => candidate.id === viewport) ?? viewports[0];
  const frameSource = useMemo(() => {
    if (!previewPath) return null;
    const separator = previewPath.includes("?") ? "&" : "?";
    return `${previewPath}${separator}outcome=${outcome}&channel=${encodeURIComponent(channel)}`;
  }, [channel, outcome, previewPath]);

  useEffect(() => {
    function receive(event: MessageEvent<unknown>) {
      const message = acceptPreviewMessage(event, {
        source: frameRef.current?.contentWindow ?? null,
        origin: window.location.origin,
        channel,
        direction: "frame-to-parent",
      });
      if (message?.type === "ready") setFrameState("ready");
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [channel]);

  function sendCommand(type: "reset" | "replay") {
    const target = frameRef.current?.contentWindow;
    if (!target) return;
    postPreviewMessage(
      target,
      createPreviewMessage(channel, type),
      window.location.origin,
    );
  }

  function remountPreview(nextOutcome: PreviewOutcome = outcome) {
    sendCommand("reset");
    setOutcome(nextOutcome);
    setFrameState("loading");
    setResetKey((value) => value + 1);
  }

  if (!frameSource) {
    return (
      <div
        role="status"
        className="grid min-h-[24rem] place-items-center bg-[#f6f1e8] p-8 text-center"
      >
        <div>
          <AlertCircle
            aria-hidden="true"
            className="mx-auto size-7 text-[#9a6926]"
          />
          <h3 className="mt-3 font-serif text-2xl text-[#17322f]">
            Preview unavailable
          </h3>
          <p className="mt-2 text-sm text-[#65726e]">
            This template does not currently expose an isolated preview route.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f1e8] p-3 sm:p-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#ded5c7] bg-white/85 p-3 lg:flex-row lg:items-center lg:justify-between">
        <fieldset>
          <legend className="sr-only">Preview viewport</legend>
          <div
            className="flex flex-wrap gap-1"
            aria-label="Preview viewport controls"
          >
            {viewports.map((candidate) => {
              const Icon = candidate.icon;
              const selected = viewport === candidate.id;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setViewport(candidate.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d]",
                    selected
                      ? "bg-[#edf4f0] text-[#0b6f5d] shadow-sm"
                      : "text-[#65726e] hover:bg-[#f6f1e8]",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {candidate.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="preview-outcome"
            className="text-xs font-semibold text-[#52625d]"
          >
            Submission result
          </label>
          <select
            id="preview-outcome"
            value={outcome}
            onChange={(event) => {
              const nextOutcome: PreviewOutcome =
                event.currentTarget.value === "failure"
                  ? "failure"
                  : "success";
              remountPreview(nextOutcome);
            }}
            className="min-h-11 rounded-xl border border-[#d8cfbf] bg-white px-3 text-sm font-semibold text-[#31534c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d]"
          >
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
          <button
            type="button"
            disabled={frameState !== "ready"}
            onClick={() => {
              sendCommand("replay");
              setReplayRequest((value) => value + 1);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d8cfbf] bg-white px-3 text-sm font-semibold text-[#31534c] hover:bg-[#f7f2e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play aria-hidden="true" className="size-4" />
            Replay
          </button>
          <button
            type="button"
            onClick={() => remountPreview()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d8cfbf] bg-white px-3 text-sm font-semibold text-[#31534c] hover:bg-[#f7f2e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d]"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {frameState === "loading"
          ? "Loading template preview."
          : frameState === "error"
            ? "Template preview failed to load."
            : `${selectedViewport.label} template preview ready.`}
      </p>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-[#d8cfbf] bg-[#ded8cd] p-2 sm:p-3">
        <div
          className="relative mx-auto overflow-hidden rounded-xl bg-white shadow-[0_18px_55px_rgba(40,34,24,0.18)] transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${selectedViewport.width}px`, maxWidth: "100%" }}
          data-preview-viewport={viewport}
          data-replay-request={replayRequest}
        >
          {frameState === "loading" ? (
            <div
              role="status"
              className="absolute inset-0 z-10 grid place-items-center bg-[#fbf8f1]"
            >
              <div className="text-center">
                <span
                  aria-hidden="true"
                  className="mx-auto block size-7 animate-spin rounded-full border-2 border-[#b9cec8] border-t-[#0b6f5d] motion-reduce:animate-none"
                />
                <p className="mt-3 text-sm font-semibold text-[#52625d]">
                  Loading preview…
                </p>
              </div>
            </div>
          ) : null}
          {frameState === "error" ? (
            <div
              role="alert"
              className="absolute inset-0 z-20 grid place-items-center bg-[#fff8ed] p-6 text-center"
            >
              <div>
                <AlertCircle
                  aria-hidden="true"
                  className="mx-auto size-7 text-[#a35c1e]"
                />
                <p className="mt-3 font-semibold text-[#663c16]">
                  The isolated preview could not be loaded.
                </p>
                <button
                  type="button"
                  onClick={() => remountPreview()}
                  className="mt-4 min-h-11 rounded-xl bg-[#0b6f5d] px-4 text-sm font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : null}
          <iframe
            ref={frameRef}
            key={`${resetKey}-${outcome}`}
            src={frameSource}
            title="Interactive Hanging Gifts template preview"
            onLoad={() => setFrameState("loading")}
            onError={() => setFrameState("error")}
            onErrorCapture={() => setFrameState("error")}
            className="block h-[min(72vh,52rem)] min-h-[34rem] w-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
