import type { ReactNode } from "react";

export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div data-formmuse-site="">{children}</div>;
}
