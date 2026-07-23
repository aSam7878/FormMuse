import {
  Boxes,
  Braces,
  Layers3,
  Palette,
  Sparkles,
  Tag,
  TextCursorInput,
} from "lucide-react";

import type { TemplatePageModel } from "@/lib/formmuse/template-page";

import { TemplatePrimaryTabs } from "./template-primary-tabs";

type TemplatePageShellProps = Readonly<{
  template: TemplatePageModel;
}>;

function DetailCard({
  icon: Icon,
  label,
  value,
  detail,
}: Readonly<{
  icon: typeof Palette;
  label: string;
  value: string;
  detail: string;
}>) {
  return (
    <div className="rounded-2xl border border-[#dfd6c7] bg-white/65 p-4 shadow-[0_12px_32px_rgba(70,55,32,0.05)]">
      <dt className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#7a8581] uppercase">
        <Icon
          aria-hidden="true"
          className="size-4 text-[#0b6f5d]"
          strokeWidth={1.7}
        />
        {label}
      </dt>
      <dd className="mt-3">
        <p className="font-serif text-xl text-[#17322f]">{value}</p>
        <p className="mt-1 text-xs leading-5 text-[#6d7773]">{detail}</p>
      </dd>
    </div>
  );
}

function ChipList({ values }: Readonly<{ values: readonly string[] }>) {
  return (
    <ul className="flex flex-wrap gap-2">
      {values.map((value) => (
        <li
          key={value}
          className="rounded-full border border-[#dbd3c7] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#435650]"
        >
          {value}
        </li>
      ))}
    </ul>
  );
}

export function TemplatePageShell({ template }: TemplatePageShellProps) {
  return (
    <main
      data-formmuse-template-route={template.slug}
      data-formmuse-template-status={template.status}
      className="relative isolate min-h-screen overflow-hidden bg-[#fbf8f1] text-[#1e3431]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_82%_10%,rgba(181,123,42,0.12),transparent_28%),radial-gradient(circle_at_8%_24%,rgba(11,111,93,0.1),transparent_30%)]"
      />

      <div className="mx-auto w-full max-w-[88rem] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
        <header className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.13em] uppercase">
            <span className="text-[#0b6f5d]">Form Template</span>
            <span aria-hidden="true" className="text-[#b7aea0]">
              /
            </span>
            <span className="text-[#6d7773]">{template.categoryLabel}</span>
          </div>

          <h1 className="mt-5 max-w-4xl font-serif text-[clamp(2.75rem,7vw,5.8rem)] leading-[0.93] tracking-[-0.045em] text-[#142d2b]">
            {template.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#5b6965] sm:text-lg sm:leading-8">
            {template.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#0b6f5d] px-3 py-1.5 text-xs font-semibold text-white">
              {template.categoryLabel}
            </span>
            <span className="rounded-full border border-[#d9cfbf] bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#53615d]">
              Version {template.version}
            </span>
            <span className="rounded-full border border-[#d9cfbf] bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#53615d]">
              {template.statusLabel}
            </span>
          </div>
        </header>

        <section aria-labelledby="template-details-title" className="mt-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#b57b2a]" />
            <h2
              id="template-details-title"
              className="text-xs font-semibold tracking-[0.16em] text-[#8c642c] uppercase"
            >
              Template details
            </h2>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard
              icon={Palette}
              label="Appearance"
              value={template.appearanceLabel}
              detail={`${template.layoutLabel} composition`}
            />
            <DetailCard
              icon={Sparkles}
              label="Animation"
              value={template.animationLabels.join(", ")}
              detail="Declared implementation technologies"
            />
            <DetailCard
              icon={Boxes}
              label="Packages"
              value={`${template.dependencies.length} dependencies`}
              detail="Installed with the distributed source"
            />
            <DetailCard
              icon={Layers3}
              label="Base UI"
              value={`${template.registryDependencies.length} controls`}
              detail="Adopter-local shadcn dependencies"
            />
          </dl>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#dfd6c7] bg-white/60 p-5">
              <div className="flex items-center gap-2">
                <TextCursorInput
                  aria-hidden="true"
                  className="size-4 text-[#0b6f5d]"
                  strokeWidth={1.7}
                />
                <h3 className="text-sm font-semibold text-[#263e39]">
                  Included fields
                </h3>
              </div>
              <div className="mt-4">
                <ChipList values={template.fieldLabels} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfd6c7] bg-white/60 p-5">
              <div className="flex items-center gap-2">
                <Tag
                  aria-hidden="true"
                  className="size-4 text-[#0b6f5d]"
                  strokeWidth={1.7}
                />
                <h3 className="text-sm font-semibold text-[#263e39]">Tags</h3>
              </div>
              <div className="mt-4">
                <ChipList values={template.tagLabels} />
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-[#dfd6c7] bg-white/60 p-5">
            <div className="flex items-center gap-2">
              <Braces
                aria-hidden="true"
                className="size-4 text-[#0b6f5d]"
                strokeWidth={1.7}
              />
              <h3 className="text-sm font-semibold text-[#263e39]">
                Implementation dependencies
              </h3>
            </div>
            <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.1em] text-[#7a8581] uppercase">
                  Packages
                </p>
                <ChipList values={template.dependencies} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.1em] text-[#7a8581] uppercase">
                  shadcn Base UI controls
                </p>
                <ChipList values={template.registryDependencies} />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-16">
          <TemplatePrimaryTabs
            previewPath={template.previewPath}
            files={template.files}
          />
        </div>
      </div>
    </main>
  );
}
