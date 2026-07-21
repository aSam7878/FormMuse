import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    ".source/**",
    "coverage/**",
    "out/**",
    "playwright-report/**",
    "public/r/**",
    "test-results/**",
    "website-v2/**",
  ]),
]);
