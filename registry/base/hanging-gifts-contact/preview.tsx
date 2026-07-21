"use client";

import { useState } from "react";

import { HangingGiftsContactForm } from "./hanging-gifts-contact-form";

const previewDelay = 900;

export function HangingGiftsContactPreview() {
  const [shouldFail] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("outcome") === "failure",
  );

  return (
    <HangingGiftsContactForm
      onSubmit={async () => {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, previewDelay);
        });

        if (shouldFail) {
          throw new Error("Preview failure");
        }
      }}
    />
  );
}
