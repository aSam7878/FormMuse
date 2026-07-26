"use strict";

/* eslint-disable @typescript-eslint/no-require-imports -- Lighthouse CI 0.15 loads only CommonJS configuration files. */
const { existsSync, readdirSync } = require("node:fs");
const { join, relative, resolve, sep } = require("node:path");

const outputDirectory = resolve(__dirname, "out");

function discoverRoutes(directory = outputDirectory) {
  if (!existsSync(directory)) {
    throw new Error("Lighthouse requires the generated out/ artifact.");
  }

  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return discoverRoutes(path);
      if (entry.name !== "index.html") return [];

      const pathname = relative(outputDirectory, directory)
        .split(sep)
        .filter(Boolean)
        .join("/");
      if (pathname === "404" || pathname === "_not-found") return [];
      return [pathname ? `/${pathname}/` : "/"];
    })
    .sort((left, right) => left.localeCompare(right));
}

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./out",
      url: discoverRoutes(),
      numberOfRuns: 1,
      settings: {
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1440,
          height: 900,
          deviceScaleFactor: 1,
          disabled: false,
        },
        throttlingMethod: "provided",
        chromeFlags: "--force-color-profile=srgb --lang=en-US",
      },
    },
  },
};
