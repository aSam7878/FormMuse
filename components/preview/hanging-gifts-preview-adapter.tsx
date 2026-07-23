"use client";

import { useState, type MouseEvent } from "react";

import {
  parsePreviewOutcome,
  simulatePreviewSubmission,
} from "@/lib/formmuse/preview-adapter";
import { HangingGiftsContactForm } from "@/registry/base/hanging-gifts-contact/hanging-gifts-contact-form";

function keepDemoDestinationsInert(event: MouseEvent<HTMLDivElement>): void {
  const target = event.target;
  if (target instanceof Element && target.closest("a[href]")) {
    event.preventDefault();
  }
}

export function HangingGiftsPreviewAdapter() {
  const [outcome] = useState(() =>
    typeof window === "undefined"
      ? "success"
      : parsePreviewOutcome(window.location.search),
  );

  return (
    <div
      data-formmuse-preview-adapter="hanging-gifts-contact"
      data-preview-outcome={outcome}
      onClickCapture={keepDemoDestinationsInert}
    >
      <HangingGiftsContactForm
        onSubmit={() => simulatePreviewSubmission(outcome)}
      />
    </div>
  );
}
