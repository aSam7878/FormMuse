import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const previewPath = "/preview/hanging-gifts-contact/";

async function completeForm(page: import("@playwright/test").Page) {
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

test("validates on submit and focuses the first invalid field", async ({
  page,
}) => {
  await page.goto(previewPath);
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByLabel("First name")).toBeFocused();
  await expect(page.getByText("Enter your first name.")).toBeVisible();
  await expect(
    page.getByText("Choose what you would like to discuss."),
  ).toBeVisible();
});

test("submits successfully when the optional last name is empty", async ({
  page,
}) => {
  await page.goto(previewPath);
  await expect(
    page.getByText("All fields are required unless marked optional."),
  ).toBeVisible();
  await expect(page.getByText("First name", { exact: true })).toBeVisible();
  await expect(
    page.locator("label").filter({ hasText: "Last name (optional)" }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("Last Name", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("First name").fill("Avery");
  await page.getByRole("combobox", { name: "Requirement" }).click();
  await page
    .getByRole("option", { name: "Corporate & Business Gifting" })
    .click();
  await page.getByLabel("Email address").fill("avery@example.com");
  await page
    .getByLabel("Message")
    .fill("I would like to discuss a thoughtful new project.");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(
    page.getByRole("heading", { name: "Message sent" }),
  ).toBeVisible();
});

test("shows pending and persistent success states without duplicate submission", async ({
  page,
}) => {
  await page.goto(previewPath);
  await completeForm(page);
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("fieldset")).toHaveAttribute("disabled", "");
  await expect(page.getByLabel("First name")).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("Sending your message…");

  const successHeading = page.getByRole("heading", { name: "Message sent" });
  await expect(successHeading).toBeVisible();
  await expect(successHeading).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Send another" }),
  ).toBeVisible();
});

test("preserves entered values after failure and retries only explicitly", async ({
  page,
}) => {
  await page.goto(`${previewPath}?outcome=failure`);
  await completeForm(page);
  await page.getByRole("button", { name: "Submit" }).click();

  const failureHeading = page.getByRole("heading", {
    name: "We could not send your message",
  });
  await expect(failureHeading).toBeVisible();
  await expect(failureHeading).toBeFocused();
  await expect(page.getByLabel("First name")).toHaveValue("Avery");
  await expect(page.getByLabel("Message")).toHaveValue(
    "I would like to discuss a thoughtful new project.",
  );
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

for (const frame of [
  { name: "narrow", width: 320, height: 820 },
  { name: "intermediate", width: 768, height: 900 },
  { name: "wide", width: 1280, height: 900 },
]) {
  test(`keeps the ${frame.name} responsive frame usable`, async ({ page }) => {
    await page.setViewportSize({ width: frame.width, height: frame.height });
    await page.goto(previewPath);

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(
      page.getByRole("heading", { name: "Let's Talk Gifting." }),
    ).toBeVisible();
    await expect(page.getByLabel("First name")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Other ways to connect." }),
    ).toBeVisible();
  });
}

test("contains no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto(previewPath);
  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test("removes infinite decorative animation in reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(previewPath);

  const infiniteAnimations = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getTiming().iterations ===
            Number.POSITIVE_INFINITY,
        ).length,
  );

  expect(infiniteAnimations).toBe(0);
});

test("preserves the original transparent-to-solid navbar transition", async ({
  page,
}) => {
  await page.goto(previewPath);
  const navbar = page.locator("[data-formmuse-navbar]");

  await expect(navbar).toHaveAttribute("data-scrolled", "false");
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(navbar).toHaveAttribute("data-scrolled", "true");
});

test("keeps the hanging gifts visibly swaying in normal motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(previewPath);
  const firstGift = page.locator("[data-formmuse-gift]").first();
  await expect(firstGift).toBeVisible();

  const initialTransform = await firstGift.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.waitForTimeout(450);
  const laterTransform = await firstGift.evaluate(
    (element) => getComputedStyle(element).transform,
  );

  expect(laterTransform).not.toBe(initialTransform);
});

test("opens and closes the original full-screen mobile navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(previewPath);

  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Template mobile navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "03 Our Products" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Template mobile navigation" }),
  ).toBeHidden();
});

test("does not make external requests during loading or form interaction", async ({
  page,
}) => {
  const externalRequests: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3100") {
      externalRequests.push(request.url());
    }
  });

  await page.goto(previewPath);
  await completeForm(page);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(
    page.getByRole("heading", { name: "Message sent" }),
  ).toBeVisible();

  expect(externalRequests).toEqual([]);
});
