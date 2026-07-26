import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const templatePath = "/templates/hanging-gifts-contact/";
const previewTitle = "Interactive Hanging Gifts template preview";
const previewSelector = `iframe[title="${previewTitle}"]`;

function expectNoAxeViolations(
  results: Awaited<ReturnType<AxeBuilder["analyze"]>>,
) {
  expect(results.violations).toEqual([]);
}

async function waitForPreview(page: Page): Promise<void> {
  const preview = page.frameLocator(previewSelector);
  await expect(
    preview.getByRole("heading", { name: "Let's Talk Gifting." }),
  ).toBeVisible();
}

test("checks the Template Page document and embedded preview document independently", async ({
  page,
}) => {
  await page.goto(templatePath);
  await waitForPreview(page);

  const siteDocument = await new AxeBuilder({ page })
    .exclude(previewSelector)
    .analyze();
  expectNoAxeViolations(siteDocument);

  const previewDocument = await new AxeBuilder({ page })
    .include([previewSelector, "html"])
    .analyze();
  expectNoAxeViolations(previewDocument);
});
