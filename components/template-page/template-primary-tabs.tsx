"use client";

import { Code2, Eye, FileCode2 } from "lucide-react";
import { useId, useRef, useState } from "react";

import type { TemplateInstallationFile } from "@/lib/formmuse/template-installation";
import type { TemplatePageFile } from "@/lib/formmuse/template-page";
import { cn } from "@/lib/utils";

import { TemplatePreviewFrame } from "./template-preview-frame";

type TemplatePrimaryTabsProps = Readonly<{
  previewPath: string;
  files: readonly (TemplatePageFile | TemplateInstallationFile)[];
}>;

function hasSource(
  file: TemplatePageFile | TemplateInstallationFile,
): file is TemplateInstallationFile {
  return "content" in file && "purpose" in file;
}

type TabId = "preview" | "code";

const tabs = [
  { id: "preview", label: "Preview", icon: Eye },
  { id: "code", label: "Code", icon: Code2 },
] as const;

export function TemplatePrimaryTabs({
  previewPath,
  files,
}: TemplatePrimaryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("preview");
  const idPrefix = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sourceFiles: TemplateInstallationFile[] = files.filter(hasSource);

  function selectTab(index: number) {
    const tab = tabs[index];
    if (!tab) {
      return;
    }

    setActiveTab(tab.id);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    selectTab(nextIndex);
  }

  return (
    <section aria-labelledby={`${idPrefix}-surface-title`}>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#9a6926] uppercase">
            Template surface
          </p>
          <h2
            id={`${idPrefix}-surface-title`}
            className="mt-1 font-serif text-2xl tracking-[-0.02em] text-[#183532] sm:text-3xl"
          >
            Explore the distributed composition
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#5e6d69]">
          Preview the isolated experience or inspect the files that reproduce
          it.
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-[#ded5c6] bg-white/75 shadow-[0_24px_70px_rgba(56,45,28,0.08)] backdrop-blur-sm">
        <div className="border-b border-[#e7dfd2] px-4 pt-3 sm:px-6">
          <div
            role="tablist"
            aria-label="Template presentation"
            className="flex gap-1"
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={`${idPrefix}-${tab.id}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${idPrefix}-${tab.id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={cn(
                    "relative inline-flex min-h-11 items-center gap-2 rounded-t-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d]",
                    selected
                      ? "text-[#0b6f5d] after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:rounded-full after:bg-[#0b6f5d]"
                      : "text-[#66736f] hover:text-[#183532]",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={1.8}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          id={`${idPrefix}-preview-panel`}
          role="tabpanel"
          aria-labelledby={`${idPrefix}-preview-tab`}
          tabIndex={0}
          hidden={activeTab !== "preview"}
          className="focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#0b6f5d]"
        >
          <TemplatePreviewFrame previewPath={previewPath} />
        </div>

        <div
          id={`${idPrefix}-code-panel`}
          role="tabpanel"
          aria-labelledby={`${idPrefix}-code-tab`}
          tabIndex={0}
          hidden={activeTab !== "code"}
          className="focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#0b6f5d]"
        >
          <div className="p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f2ed] text-[#0b6f5d]">
                <FileCode2
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={1.7}
                />
              </span>
              <div>
                <h3 className="font-serif text-2xl text-[#17322f]">
                  Distributed file manifest
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#62706c]">
                  Every entry below comes from the validated Registry Record and
                  belongs to the installable template boundary.
                </p>
              </div>
            </div>

            <ul className="mt-6 divide-y divide-[#e8e0d4] overflow-hidden rounded-2xl border border-[#e1d8ca] bg-[#fbf9f5]">
              {files.map((file) => (
                <li
                  key={file.path}
                  className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold text-[#25433e] sm:text-sm">
                      {file.path}
                    </p>
                    {file.target ? (
                      <p className="mt-1 truncate font-mono text-[0.7rem] text-[#78827f]">
                        Installs to {file.target}
                      </p>
                    ) : null}
                  </div>
                  <span className="w-fit rounded-full border border-[#d9d0c2] bg-white px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.08em] text-[#6c756f] uppercase">
                    {file.type.replace("registry:", "")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-3">
              {sourceFiles.map((file) => (
                <details
                  key={`${file.path}-source`}
                  className="group rounded-2xl border border-[#e1d8ca] bg-[#fbf9f5] open:bg-white"
                >
                  <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 py-3 font-mono text-xs font-semibold text-[#29443f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d]">
                    <span className="min-w-0 break-all">{file.path}</span>
                    <span className="shrink-0 text-[#0b6f5d] group-open:hidden">
                      View source
                    </span>
                    <span className="hidden shrink-0 text-[#0b6f5d] group-open:inline">
                      Hide source
                    </span>
                  </summary>
                  <div className="border-t border-[#e1d8ca] bg-[#182421] p-4 text-[#eaf2ed]">
                    <p className="mb-3 text-xs leading-5 text-[#c6d5d0]">
                      {file.purpose}
                    </p>
                    <pre className="max-h-[32rem] overflow-auto text-xs leading-6">
                      <code>{file.content}</code>
                    </pre>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
