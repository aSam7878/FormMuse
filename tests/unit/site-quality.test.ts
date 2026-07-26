import { describe, expect, it } from "vitest";

import {
  lighthouseFailures,
  siteQualityRoutes,
  type LighthouseReport,
} from "../../lib/formmuse/site-quality";

describe("exported site quality routes", () => {
  it("includes current and future site routes while excluding static not-found artifacts", () => {
    expect(
      siteQualityRoutes(
        [
          "index.html",
          "404/index.html",
          "_not-found/index.html",
          "templates/index.html",
          "templates/hanging-gifts-contact/index.html",
          "preview/hanging-gifts-contact/index.html",
          "docs/template-api/index.html",
        ],
        "production",
      ),
    ).toEqual([
      { path: "/", kind: "homepage", indexable: true },
      { path: "/docs/template-api/", kind: "guide", indexable: true },
      {
        path: "/preview/hanging-gifts-contact/",
        kind: "preview",
        indexable: false,
      },
      { path: "/templates/", kind: "catalog", indexable: true },
      {
        path: "/templates/hanging-gifts-contact/",
        kind: "template-page",
        indexable: true,
      },
    ]);
  });

  it("keeps the entire preview artifact out of SEO assertions", () => {
    expect(
      siteQualityRoutes(
        ["index.html", "preview/hanging-gifts-contact/index.html"],
        "preview",
      ),
    ).toEqual([
      { path: "/", kind: "homepage", indexable: false },
      {
        path: "/preview/hanging-gifts-contact/",
        kind: "preview",
        indexable: false,
      },
    ]);
  });
});

describe("Lighthouse quality evidence", () => {
  const route = {
    path: "/templates/hanging-gifts-contact/" as const,
    kind: "template-page" as const,
    indexable: true,
  };
  const passingReport: LighthouseReport = {
    finalUrl: "http://127.0.0.1:3200/templates/hanging-gifts-contact/",
    categories: {
      performance: { score: 0.91 },
      accessibility: { score: 1 },
      "best-practices": { score: 1 },
      seo: { score: 1 },
    },
    audits: { "errors-in-console": { score: 1 } },
  };

  it("requires every indexable score and a clean console", () => {
    expect(lighthouseFailures(passingReport, route)).toEqual([]);
    expect(
      lighthouseFailures(
        {
          ...passingReport,
          categories: {
            ...passingReport.categories,
            performance: { score: 0.89 },
            seo: { score: 0.99 },
          },
          audits: { "errors-in-console": { score: 0 } },
        },
        route,
      ),
    ).toEqual([
      "/templates/hanging-gifts-contact/ performance score must be at least 0.9, received 0.89.",
      "/templates/hanging-gifts-contact/ seo score must be at least 1, received 0.99.",
      "/templates/hanging-gifts-contact/ reported a browser console error.",
    ]);
  });
});
