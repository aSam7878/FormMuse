"use client";

import { HangingGiftsContactForm } from "./hanging-gifts-contact-form";
import type { HangingGiftsContactFormValues } from "./hanging-gifts-contact-form.schema";

async function submitContact(
  values: HangingGiftsContactFormValues,
): Promise<void> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("The adopter-owned contact endpoint rejected the request.");
  }
}

export function HangingGiftsContactBackendExample() {
  return <HangingGiftsContactForm onSubmit={submitContact} />;
}
