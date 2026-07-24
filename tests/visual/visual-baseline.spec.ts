import { expect, test, type Locator, type Page } from "@playwright/test";

const previewPath = "/preview/hanging-gifts-contact/";
const templatePath = "/templates/hanging-gifts-contact/";

async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(async () => document.fonts.ready);
}

async function openVisualPage(
  page: Page,
  path: string,
  reducedMotion: "no-preference" | "reduce" = "no-preference",
): Promise<void> {
  await page.clock.install({ time: new Date("2026-07-24T00:00:00.000Z") });
  await page.emulateMedia({ colorScheme: "light", reducedMotion });
  await page.goto(path);
  await waitForFonts(page);
}

async function completeForm(page: Page): Promise<void> {
  await page.getByLabel("First name").fill("Avery");
  await page.getByLabel("Last name (optional)").fill("Stone");
  await page.getByRole("combobox", { name: "Requirement" }).click();
  await page
    .getByRole("option", { name: "Corporate & Business Gifting" })
    .click();
  await page.getByLabel("Email address").fill("avery@example.com");
  await page
    .getByLabel("Message")
    .fill("I would like to discuss a thoughtful new project.");
}

async function freezeVisualMotion(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => undefined;
  });
}

async function expectVisual(page: Page, name: string): Promise<void> {
  await freezeVisualMotion(page);
  const screenshot = await page.screenshot({
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });
  expect(screenshot).toMatchSnapshot(name);
}

async function expectElementVisual(
  page: Page,
  locator: Locator,
  name: string,
): Promise<void> {
  await page.locator("header").evaluateAll((headers) => {
    for (const header of headers) {
      header.setAttribute("data-formmuse-visual-hidden", "");
      (header as HTMLElement).style.visibility = "hidden";
    }
  });
  const clip = await locator.boundingBox();
  if (!clip) throw new Error(`Visual target is unavailable: ${name}`);
  const screenshot = await page.screenshot({
    animations: "disabled",
    caret: "hide",
    clip: {
      x: Math.floor(clip.x),
      y: Math.floor(clip.y),
      width: Math.ceil(clip.width),
      height: Math.ceil(clip.height),
    },
    scale: "css",
  });
  expect(screenshot).toMatchSnapshot(name);
}

async function expectStableElementVisual(
  locator: Locator,
  name: string,
): Promise<void> {
  const screenshot = await locator.screenshot({
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });
  expect(screenshot).toMatchSnapshot(name);
}

test("captures the approved narrow, breakpoint-adjacent, and wide compositions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 820 });
  await openVisualPage(page, previewPath);
  await expectVisual(page, "preview-narrow-320.png");

  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(previewPath);
  await waitForFonts(page);
  await page.getByRole("button", { name: "Submit" }).scrollIntoViewIfNeeded();
  await expectVisual(page, "preview-breakpoint-768.png");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(previewPath);
  await waitForFonts(page);
  await expectVisual(page, "preview-wide-1440.png");
});

test("captures the approved pending, failure, and success form states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openVisualPage(page, previewPath);
  await completeForm(page);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("status")).toHaveText("Sending your message…");
  await freezeVisualMotion(page);
  await expectElementVisual(page, page.locator("form"), "preview-pending.png");

  await page.goto(`${previewPath}?outcome=failure`);
  await waitForFonts(page);
  await completeForm(page);
  await page.getByRole("button", { name: "Submit" }).click();
  await page.clock.runFor(900);
  await expect(
    page.getByRole("heading", { name: "We could not send your message" }),
  ).toBeVisible();
  await page.clock.runFor(500);
  await expectElementVisual(
    page,
    page
      .getByRole("heading", { name: "We could not send your message" })
      .locator(".."),
    "preview-failure.png",
  );

  await page.goto(previewPath);
  await waitForFonts(page);
  await completeForm(page);
  await page.getByRole("button", { name: "Submit" }).click();
  await page.clock.runFor(900);
  await expect(
    page.getByRole("heading", { name: "Message sent" }),
  ).toBeVisible();
  await page.clock.runFor(500);
  await expectStableElementVisual(
    page.getByRole("heading", { name: "Message sent" }).locator(".."),
    "preview-success.png",
  );
});

test("captures the approved reduced-motion and preview-chrome states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openVisualPage(page, previewPath, "reduce");
  await expectVisual(page, "preview-reduced-motion.png");

  await page.goto(templatePath);
  await waitForFonts(page);
  const previewChrome = page.locator("[data-preview-viewport]");
  await previewChrome.scrollIntoViewIfNeeded();
  await expectVisual(page, "template-page-preview-chrome.png");
});
