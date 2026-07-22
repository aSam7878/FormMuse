"use client";

import { HangingGiftsContactForm } from "./hanging-gifts-contact-form";
import type { HangingGiftsContactFormValues } from "./hanging-gifts-contact-form.schema";

function handleSubmit(values: HangingGiftsContactFormValues): Promise<void> {
  void values;
  return Promise.resolve();
}

export function HangingGiftsContactExample() {
  return <HangingGiftsContactForm onSubmit={handleSubmit} />;
}
