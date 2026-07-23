"use client";

import {
  AlertTriangle,
  Check,
  Clipboard,
  FileCode2,
  PackageCheck,
} from "lucide-react";
import { useId, useRef, useState } from "react";

import type {
  PackageManager,
  TemplateInstallationModel,
} from "@/lib/formmuse/template-installation";
import { cn } from "@/lib/utils";

type InstallationTab = "cli" | "manual";
const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const;

function CopyButton({
  value,
  label = "Copy",
}: Readonly<{ value: string; label?: string }>) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d8cfbf] bg-white px-3 text-xs font-semibold text-[#31534c] hover:bg-[#f7f2e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d]"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Clipboard aria-hidden="true" className="size-4" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

function Command({ command }: Readonly<{ command: string }>) {
  return (
    <div className="grid gap-3 rounded-2xl border border-[#ded5c7] bg-[#182421] p-4 text-white sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <code className="overflow-x-auto font-mono text-xs leading-6 text-[#eaf2ed] sm:text-sm">
        {command}
      </code>
      <CopyButton value={command} />
    </div>
  );
}

export function TemplateInstallation({
  installation,
}: Readonly<{ installation: TemplateInstallationModel }>) {
  const [activeTab, setActiveTab] = useState<InstallationTab>("cli");
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm");
  const id = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabs = ["cli", "manual"] as const;

  function moveTab(index: number) {
    setActiveTab(tabs[index]);
    tabRefs.current[index]?.focus();
  }

  return (
    <section aria-labelledby={`${id}-installation-title`} className="mt-16">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#9a6926] uppercase">
        Install the template
      </p>
      <h2
        id={`${id}-installation-title`}
        className="mt-2 font-serif text-4xl tracking-[-0.035em] text-[#17322f] sm:text-5xl"
      >
        Installation
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d6b67] sm:text-base">
        Check the target project first, then choose the CLI or the equivalent
        manual path.
      </p>

      <div className="mt-7 rounded-[1.5rem] border border-[#dfd5c5] bg-white/70 p-5 shadow-[0_18px_50px_rgba(60,46,25,0.06)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#eaf2e8] text-[#0b6f5d]">
            <PackageCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="font-serif text-2xl text-[#17322f]">
              Installation Preflight
            </h3>
            <p className="text-sm text-[#65726e]">
              This template requires the following environment.
            </p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {installation.requirements.map((requirement) => (
            <div
              key={requirement.name}
              className="rounded-2xl border border-[#e1d8ca] bg-[#fbf9f5] p-4"
            >
              <dt className="font-semibold text-[#24413b]">
                {requirement.name}
              </dt>
              <dd className="mt-1 text-xs leading-5 text-[#697570]">
                {requirement.detail}
              </dd>
            </div>
          ))}
        </dl>
        <div
          role="note"
          className="mt-4 flex gap-3 rounded-2xl border border-[#edc993] bg-[#fff8ed] p-4 text-sm leading-6 text-[#744513]"
        >
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0"
          />
          <p>
            {installation.radixWarning} FormMuse will not migrate or reconfigure
            these projects automatically.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#dfd5c5] bg-white/75 shadow-[0_18px_50px_rgba(60,46,25,0.06)]">
        <div
          role="tablist"
          aria-label="Installation method"
          className="flex gap-1 border-b border-[#e5ddd0] px-5 pt-3"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={`${id}-${tab}-tab`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${id}-${tab}-panel`}
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(event) => {
                let next: number | undefined;
                if (event.key === "ArrowRight")
                  next = (index + 1) % tabs.length;
                if (event.key === "ArrowLeft")
                  next = (index - 1 + tabs.length) % tabs.length;
                if (event.key === "Home") next = 0;
                if (event.key === "End") next = tabs.length - 1;
                if (next !== undefined) {
                  event.preventDefault();
                  moveTab(next);
                }
              }}
              className={cn(
                "relative min-h-11 px-4 text-sm font-semibold capitalize focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d]",
                activeTab === tab
                  ? "text-[#0b6f5d] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-[#0b6f5d]"
                  : "text-[#697570]",
              )}
            >
              {tab === "cli" ? "CLI" : "Manual"}
            </button>
          ))}
        </div>

        <div
          id={`${id}-cli-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-cli-tab`}
          hidden={activeTab !== "cli"}
          className="p-5 sm:p-7"
        >
          <fieldset>
            <legend className="text-sm font-semibold text-[#29443f]">
              Choose your package manager
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {packageManagers.map((manager) => (
                <button
                  key={manager}
                  type="button"
                  aria-pressed={packageManager === manager}
                  onClick={() => setPackageManager(manager)}
                  className={cn(
                    "min-h-11 rounded-xl border px-4 text-sm font-semibold",
                    packageManager === manager
                      ? "border-[#0b6f5d] bg-[#edf4f0] text-[#0b6f5d]"
                      : "border-[#ded5c7] bg-white text-[#61706b]",
                  )}
                >
                  {manager === "npm"
                    ? "npm"
                    : manager[0].toUpperCase() + manager.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#29443f]">
                If shadcn is not initialized
              </h3>
              <p className="mt-1 text-xs text-[#6b7773]">
                Initialize Base UI explicitly, then run the separate template
                command.
              </p>
              <div className="mt-3">
                <Command
                  command={installation.commands[packageManager].initialize}
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#29443f]">
                Install Hanging Gifts
              </h3>
              <div className="mt-3">
                <Command
                  command={installation.commands[packageManager].install}
                />
              </div>
            </div>
            <p className="text-xs leading-5 text-[#697570]">
              Coding agents and troubleshooting sessions may inspect the project
              with{" "}
              <code className="rounded bg-[#f2eee6] px-1.5 py-1">
                {installation.commands[packageManager].inspect}
              </code>
              . Human installation does not require this diagnostic.
            </p>
          </div>
        </div>

        <div
          id={`${id}-manual-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-manual-tab`}
          hidden={activeTab !== "manual"}
          className="p-5 sm:p-7"
        >
          <ol className="space-y-7">
            <li>
              <h3 className="font-serif text-2xl text-[#17322f]">
                1. Install package dependencies
              </h3>
              <ul className="mt-3 grid gap-2 lg:grid-cols-2">
                {installation.dependencies.map((item) => (
                  <li
                    key={item.dependency}
                    className="rounded-xl border border-[#e2d9cc] bg-[#fbf9f5] p-3"
                  >
                    <code className="text-xs font-semibold text-[#0b6f5d]">
                      {item.dependency}
                    </code>
                    <p className="mt-1 text-xs leading-5 text-[#6b7773]">
                      {item.purpose}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <h3 className="font-serif text-2xl text-[#17322f]">
                2. Add required Base UI controls
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {installation.registryDependencies.map((item) => (
                  <li
                    key={item.dependency}
                    className="rounded-xl border border-[#e2d9cc] p-3"
                  >
                    <code className="text-xs font-semibold text-[#0b6f5d]">
                      {item.dependency}
                    </code>
                    <p className="mt-1 text-xs leading-5 text-[#6b7773]">
                      {item.purpose}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <h3 className="font-serif text-2xl text-[#17322f]">
                3. Copy every distributed file
              </h3>
              <ul className="mt-3 space-y-2">
                {installation.files.map((file) => (
                  <li
                    key={file.path}
                    className="rounded-xl border border-[#e2d9cc] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode2
                        aria-hidden="true"
                        className="size-4 text-[#0b6f5d]"
                      />
                      <code className="text-xs font-semibold break-all text-[#29443f]">
                        {file.path}
                      </code>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#6b7773]">
                      {file.purpose} Target: <code>{file.target}</code>
                    </p>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <h3 className="font-serif text-2xl text-[#17322f]">
                4. Preserve styles, animation, font, and assets
              </h3>
              <ol className="mt-3 space-y-2">
                {installation.stylesheetAndAnimationSteps.map((step) => (
                  <li
                    key={step.title}
                    className="rounded-xl border border-[#e2d9cc] p-3"
                  >
                    <p className="text-sm font-semibold text-[#29443f]">
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#6b7773]">
                      {step.instruction}
                    </p>
                  </li>
                ))}
              </ol>
            </li>
            <li>
              <h3 className="font-serif text-2xl text-[#17322f]">
                5. Import and render
              </h3>
              <p className="mt-2 text-sm text-[#697570]">
                Import from{" "}
                <code className="rounded bg-[#f2eee6] px-1.5 py-1">
                  {installation.importPath}
                </code>
                , then connect the typed <code>onSubmit</code> boundary.
              </p>
              <div className="mt-3 rounded-2xl bg-[#182421] p-4 text-[#eaf2ed]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <code className="text-xs text-[#c6d5d0]">
                    {installation.finalUsageExamplePath}
                  </code>
                  <CopyButton value={installation.finalUsageSource} />
                </div>
                <pre className="max-h-96 overflow-auto text-xs leading-6">
                  <code>{installation.finalUsageSource}</code>
                </pre>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
