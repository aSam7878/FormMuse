import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import { resolveBuildOrigin } from "@/lib/formmuse/build-origin";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const siteMetadata = {
  title: {
    default: "FormMuse",
    template: "%s — FormMuse",
  },
  description: "Premium, ready-to-paste Form Templates for React applications.",
} satisfies Metadata;

export function generateMetadata(): Metadata {
  const buildOrigin = resolveBuildOrigin();

  if (buildOrigin.isIndexable) {
    return siteMetadata;
  }

  return {
    ...siteMetadata,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
