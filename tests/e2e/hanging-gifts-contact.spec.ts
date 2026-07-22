import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";

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

async function expectPrimaryTarget(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);

  const isUnobscured = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const topmost = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    return topmost === element || element.contains(topmost);
  });
  expect(isUnobscured).toBe(true);
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
  { name: "below tablet", width: 767, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "below wide", width: 1023, height: 900 },
  { name: "wide boundary", width: 1024, height: 900 },
  { name: "intended wide", width: 1440, height: 900 },
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

test("keeps primary targets large, separated, and above decorative artwork", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 820 });
  await page.goto(previewPath);

  const targets = [
    page.getByRole("button", { name: "Open navigation" }),
    page.getByLabel("First name"),
    page.getByLabel("Last name (optional)"),
    page.getByRole("combobox", { name: "Requirement" }),
    page.getByLabel("Email address"),
    page.getByLabel("Message"),
    page.getByRole("button", { name: "Submit" }),
  ];

  for (const target of targets) {
    await expectPrimaryTarget(target);
  }

  const formTargetRects = await page
    .locator('form input, form [role="combobox"], form textarea, form button')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          top: rect.top,
        };
      }),
    );

  for (let index = 0; index < formTargetRects.length; index += 1) {
    for (let next = index + 1; next < formTargetRects.length; next += 1) {
      const first = formTargetRects[index];
      const second = formTargetRects[next];
      const overlaps =
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top;
      expect(overlaps).toBe(false);
    }
  }
});

test("supports logical keyboard order and Escape-closing mobile navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(previewPath);

  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await page.keyboard.press("Tab");
  await expect(menuButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "Template mobile navigation" }),
  ).toBeVisible();

  const firstNavigationLink = page.getByRole("button", { name: "01 Home" });
  await expect(firstNavigationLink).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(firstNavigationLink).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menuButton).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Template mobile navigation" }),
  ).toBeHidden();

  for (const control of [
    page.getByLabel("First name"),
    page.getByLabel("Last name (optional)"),
    page.getByRole("combobox", { name: "Requirement" }),
    page.getByLabel("Email address"),
    page.getByLabel("Message"),
    page.getByRole("button", { name: "Submit" }),
  ]) {
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
  }
});

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
  for (const selector of [
    ".hgc-hero-overline",
    ".hgc-hero-title",
    ".hgc-hero-description",
    ".hgc-form-section",
  ]) {
    const styles = await page.locator(selector).evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        opacity: computed.opacity,
        visibility: computed.visibility,
      };
    });
    expect(styles).toEqual({ opacity: "1", visibility: "visible" });
  }
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
