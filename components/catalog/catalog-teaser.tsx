import { Gift } from "lucide-react";

import { teaserPreviewSource } from "@/lib/formmuse/catalog-teaser";

export function CatalogTeaser({
  title,
  description,
  templatePath,
  previewPath,
  active = false,
}: Readonly<{
  title: string;
  description: string;
  templatePath: string;
  previewPath: string;
  active?: boolean;
}>) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#dfd5c5] bg-white shadow-[0_18px_50px_rgba(60,46,25,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#f8efe1,#fffaf2_55%,#e7f0eb)]">
        <div
          className="absolute inset-0 grid place-items-center"
          aria-hidden="true"
        >
          <div className="text-center text-[#8c642c]">
            <Gift className="mx-auto size-8" />
            <p className="mt-2 text-xs font-semibold tracking-[0.14em] uppercase">
              Hanging Gifts preview
            </p>
          </div>
        </div>
        {active ? (
          <iframe
            src={teaserPreviewSource(previewPath)}
            title={`${title} decorative catalog teaser`}
            aria-hidden="true"
            tabIndex={-1}
            scrolling="no"
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
          />
        ) : null}
      </div>
      <div className="p-5">
        <h2 className="font-serif text-2xl text-[#17322f]">
          <a
            href={templatePath}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b6f5d]"
          >
            {title}
          </a>
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#65726e]">{description}</p>
      </div>
    </article>
  );
}
