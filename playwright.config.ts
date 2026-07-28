import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox-desktop",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit-desktop",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "chromium-mobile-emulation",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "webkit-mobile-emulation",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command:
      "FORMMUSE_DEPLOY_ENV=development FORMMUSE_SITE_URL=http://127.0.0.1:3100 FORMMUSE_PREVIEW_URL=http://127.0.0.1:3101 pnpm build && FORMMUSE_SITE_URL=http://127.0.0.1:3100 node --import tsx scripts/serve-preview-origins.mts",
    url: "http://127.0.0.1:3101/preview/hanging-gifts-contact/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
