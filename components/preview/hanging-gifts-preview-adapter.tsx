"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

import {
  parsePreviewOutcome,
  simulatePreviewSubmission,
} from "@/lib/formmuse/preview-adapter";
import {
  acceptPreviewMessage,
  createPreviewMessage,
  postPreviewMessage,
  previewChannelFromSearch,
} from "@/lib/formmuse/preview-protocol";
import {
  parsePreviewMode,
  TEASER_ADVANCE_DELAY_MS,
} from "@/lib/formmuse/catalog-teaser";
import { HangingGiftsContactForm } from "@/registry/base/hanging-gifts-contact/hanging-gifts-contact-form";

function keepDemoDestinationsInert(event: MouseEvent<HTMLDivElement>): void {
  const target = event.target;
  if (target instanceof Element && target.closest("a[href]")) {
    event.preventDefault();
  }
}

export function HangingGiftsPreviewAdapter({
  parentOrigin,
}: Readonly<{ parentOrigin: string }>) {
  const [outcome] = useState(() =>
    typeof window === "undefined"
      ? "success"
      : parsePreviewOutcome(window.location.search),
  );
  const [resetKey, setResetKey] = useState(0);
  const [animationReplayKey, setAnimationReplayKey] = useState(0);
  const [channel] = useState(() =>
    typeof window === "undefined"
      ? null
      : previewChannelFromSearch(window.location.search),
  );
  const [mode] = useState(() =>
    typeof window === "undefined"
      ? "interactive"
      : parsePreviewMode(window.location.search),
  );
  const receivedSequenceRef = useRef(0);

  useEffect(() => {
    if (mode !== "teaser") return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const timer = window.setTimeout(() => {
      document.forms.item(0)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, TEASER_ADVANCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    if (!channel) return;
    const validatedChannel = channel;
    function receive(event: MessageEvent<unknown>) {
      const message = acceptPreviewMessage(event, {
        source: window.parent,
        origin: parentOrigin,
        channel: validatedChannel,
        direction: "parent-to-frame",
        afterSequence: receivedSequenceRef.current,
      });
      if (!message) return;
      receivedSequenceRef.current = message.sequence;
      if (message.type === "reset") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        setAnimationReplayKey(0);
        setResetKey((value) => value + 1);
      } else if (message.type === "replay") {
        setAnimationReplayKey((value) => value + 1);
      }
    }
    window.addEventListener("message", receive);
    const readyTimer = window.setTimeout(() => {
      postPreviewMessage(
        window.parent,
        createPreviewMessage(validatedChannel, "ready"),
        parentOrigin,
      );
    }, 250);
    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener("message", receive);
    };
  }, [channel, parentOrigin]);

  return (
    <div
      data-formmuse-preview-adapter="hanging-gifts-contact"
      data-preview-outcome={outcome}
      data-preview-mode={mode}
      aria-hidden={mode === "teaser" ? "true" : undefined}
      inert={mode === "teaser" ? true : undefined}
      onClickCapture={keepDemoDestinationsInert}
    >
      <HangingGiftsContactForm
        key={resetKey}
        animationReplayKey={animationReplayKey}
        onSubmit={() => simulatePreviewSubmission(outcome)}
      />
    </div>
  );
}
