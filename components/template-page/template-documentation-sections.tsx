"use client";

import {
  Check,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import type { TemplatePresentationModel } from "@/lib/formmuse/template-presentation";

function CopyPrompt({ value }: Readonly<{ value: string }>) {
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
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6f5d] px-4 text-sm font-semibold text-white hover:bg-[#085b4d] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0b6f5d]"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Clipboard aria-hidden="true" className="size-4" />
      )}
      {copied ? "Agent Prompt copied" : "Copy Agent Prompt"}
    </button>
  );
}

export function TemplateDocumentationSections({
  presentation,
}: Readonly<{ presentation: TemplatePresentationModel }>) {
  return (
    <div className="mt-16 space-y-16">
      <section aria-labelledby="examples-title">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#9a6926] uppercase">
          Type-checked examples
        </p>
        <h2
          id="examples-title"
          className="mt-2 font-serif text-4xl tracking-[-0.035em] text-[#17322f] sm:text-5xl"
        >
          Usage
        </h2>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {presentation.examples.map((example) => (
            <article
              key={example.path}
              className="overflow-hidden rounded-[1.5rem] border border-[#dfd5c5] bg-white/75 shadow-[0_18px_50px_rgba(60,46,25,0.05)]"
            >
              <div className="p-5">
                <h3 className="font-serif text-2xl text-[#17322f]">
                  {example.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#65726e]">
                  {example.description}
                </p>
              </div>
              <div className="border-t border-[#dfd5c5] bg-[#182421] p-4 text-[#eaf2ed]">
                <p className="mb-3 font-mono text-[0.68rem] break-all text-[#aebfba]">
                  {example.path}
                </p>
                <pre className="max-h-96 overflow-auto text-xs leading-6">
                  <code>{example.source}</code>
                </pre>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="props-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#9a6926] uppercase">
              Structured API
            </p>
            <h2
              id="props-title"
              className="mt-2 font-serif text-4xl tracking-[-0.035em] text-[#17322f] sm:text-5xl"
            >
              Props
            </h2>
          </div>
          <a
            href={presentation.templateApiPath}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#0b6f5d] underline decoration-[#9bc1b8] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0b6f5d]"
          >
            Read the canonical Template API guide{" "}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-[#dfd5c5] bg-white/75">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead className="bg-[#f3eee5] text-xs tracking-[0.09em] text-[#52625d] uppercase">
              <tr>
                <th className="p-4">Prop</th>
                <th className="p-4">Type</th>
                <th className="p-4">Default</th>
                <th className="p-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0]">
              {presentation.props.map((prop) => (
                <tr key={prop.name} className="align-top">
                  <th
                    scope="row"
                    className="p-4 font-mono text-xs text-[#0b6f5d]"
                  >
                    {prop.name}
                    {prop.required ? (
                      <span className="text-[#a35c1e]"> *</span>
                    ) : null}
                  </th>
                  <td className="p-4 font-mono text-xs text-[#324b46]">
                    {prop.type}
                  </td>
                  <td className="p-4 font-mono text-xs text-[#65726e]">
                    {prop.default ?? "—"}
                  </td>
                  <td className="p-4 leading-6 text-[#5e6d68]">
                    {prop.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-labelledby="notes-title"
        className="grid gap-4 lg:grid-cols-2"
      >
        <div className="rounded-[1.5rem] border border-[#dfd5c5] bg-white/70 p-6">
          <h2 id="notes-title" className="font-serif text-3xl text-[#17322f]">
            Template notes
          </h2>
          <ul className="mt-5 space-y-3">
            {presentation.usageNotes.map((note) => (
              <li
                key={note}
                className="flex gap-3 text-sm leading-6 text-[#5e6d68]"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-[#0b6f5d]"
                />
                {note}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.5rem] border border-[#dfd5c5] bg-white/70 p-6">
          <h2 className="font-serif text-3xl text-[#17322f]">Accessibility</h2>
          <ul className="mt-5 space-y-3">
            {presentation.accessibilityNotes.map((note) => (
              <li
                key={note}
                className="flex gap-3 text-sm leading-6 text-[#5e6d68]"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-[#0b6f5d]"
                />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="changelog-title"
        className="rounded-[1.5rem] border border-[#dfd5c5] bg-white/70 p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[#9a6926] uppercase">
              Version {presentation.version} · Updated {presentation.updated}
            </p>
            <h2
              id="changelog-title"
              className="mt-2 font-serif text-3xl text-[#17322f]"
            >
              Changelog
            </h2>
          </div>
          <code className="text-xs text-[#65726e]">
            {presentation.changelogPath}
          </code>
        </div>
        <pre className="mt-5 rounded-2xl bg-[#f6f1e8] p-4 font-sans text-sm leading-7 whitespace-pre-wrap text-[#52625d]">
          {presentation.changelogSource}
        </pre>
      </section>

      <section
        aria-labelledby="agent-prompt-title"
        className="relative overflow-hidden rounded-[1.5rem] border border-[#e5c898] bg-[linear-gradient(120deg,#fff7e9,#f5efe5_48%,#e9f3ee)] p-6 sm:p-8"
      >
        <Sparkles
          aria-hidden="true"
          className="absolute top-6 right-6 size-8 text-[#b57b2a] opacity-60"
        />
        <p className="text-xs font-semibold tracking-[0.16em] text-[#9a6926] uppercase">
          Agent handoff
        </p>
        <h2
          id="agent-prompt-title"
          className="mt-2 max-w-2xl font-serif text-3xl tracking-[-0.025em] text-[#17322f] sm:text-4xl"
        >
          Install with your coding agent
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5e6d68]">
          The prompt is generated from the registry, installation documentation,
          and exported form contract.
        </p>
        <div className="mt-6">
          <CopyPrompt value={presentation.agentPrompt} />
        </div>
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-semibold text-[#31534c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f5d]">
            Review prompt text
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-2xl bg-white/70 p-4 text-xs leading-6 whitespace-pre-wrap text-[#405650]">
            {presentation.agentPrompt}
          </pre>
        </details>
      </section>
    </div>
  );
}
