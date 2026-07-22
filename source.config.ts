import { defineConfig, defineDocs } from "fumadocs-mdx/config";

import { GuideFrontmatterSchema } from "./lib/formmuse/guide-contract";

export const guides = defineDocs({
  dir: "content/guides",
  docs: {
    schema: GuideFrontmatterSchema,
  },
});

export default defineConfig();
