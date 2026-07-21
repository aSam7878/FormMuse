import type { Metadata } from "next";

import { HangingGiftsContactPreview } from "@/registry/base/hanging-gifts-contact/preview";

export const metadata: Metadata = {
  title: "Hanging Gifts Contact Form Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HangingGiftsContactPreviewPage() {
  return <HangingGiftsContactPreview />;
}
