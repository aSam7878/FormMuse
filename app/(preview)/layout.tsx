import type { ReactNode } from "react";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
