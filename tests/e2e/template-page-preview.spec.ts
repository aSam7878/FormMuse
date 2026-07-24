import {
  expect,
  test,
  type Frame,
  type FrameLocator,
  type Page,
} from "@playwright/test";

const templatePath = "/templates/hanging-gifts-contact/";
const previewPath = "/preview/hanging-gifts-contact/";
const previewTitle = "Interactive Hanging Gifts template preview";

declare global {
  interface Window {
    __formmusePreviewTracker: { beforeUnload: number; history: number };
  }
}

function previewFrame(page: Page): FrameLocator {
  return page.frameLocator(`iframe[title="${previewTitle}"]`);
}

async function waitForPreview(page: Page): Promise<FrameLocator> {
  const frame = previewFrame(page);
  await expect(
    frame.getByRole("heading", { name: "Let's Talk Gifting." }),
  ).toBeVisible();
  return frame;
}

async function previewContent(page: Page): Promise<Frame> {
  const iframe = page.getByTitle(previewTitle);
  const handle = await iframe.elementHandle();
  const content = await handle?.contentFrame();
  if (!content) throw new Error("Interactive preview frame is unavailable.");
  return content;
}

async function completeForm(frame: FrameLocator): Promise<void> {
  await frame.getByLabel("First name").fill("Avery");
  await frame.getByLabel("Last name (optional)").fill("Stone");
  await frame.getByRole("combobox", { name: "Requirement" }).click();
  await frame
    .getByRole("option", { name: "Corporate & Business Gifting" })
    .click();
  await frame.getByLabel("Email address").fill("avery@example.com");
  await frame
    .getByLabel("Message")
    .fill("I would like to discuss a thoughtful new project.");
}

test("keeps the Template Page controls and iframe preview connected", async ({
  page,
}) => {
  await page.goto(templatePath);
  await waitForPreview(page);

  const viewport = page.locator("[data-preview-viewport]");
  await expect(viewport).toHaveAttribute("data-preview-viewport", "desktop");
  await page.getByRole("button", { name: "Tablet" }).click();
  await expect(viewport).toHaveAttribute("data-preview-viewport", "tablet");
  await page.getByRole("button", { name: "Mobile" }).click();
  await expect(viewport).toHaveAttribute("data-preview-viewport", "mobile");

  await page.getByRole("tab", { name: "Code" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Preview" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Code" })).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Distributed file manifest" }),
  ).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await waitForPreview(page);
});

test("keeps Replay stateful and makes Reset a full preview remount", async ({
  page,
}) => {
  await page.goto(templatePath);
  const frame = await waitForPreview(page);
  const firstName = frame.getByLabel("First name");
  const iframe = page.getByTitle(previewTitle);
  const sourceBeforeReset = await iframe.getAttribute("src");

  await firstName.fill("Avery");
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(firstName).toHaveValue("Avery");
  await expect(page.locator("[data-replay-request]")).toHaveAttribute(
    "data-replay-request",
    "1",
  );

  await page.getByRole("button", { name: "Reset" }).click();
  await expect
    .poll(() => iframe.getAttribute("src"))
    .not.toBe(sourceBeforeReset);
  const resetFrame = await waitForPreview(page);
  await expect(resetFrame.getByLabel("First name")).toHaveValue("");
  const resetContent = await previewContent(page);
  await expect.poll(() => resetContent?.evaluate(() => window.scrollY)).toBe(0);
});

test("uses the parent-selected deterministic failure outcome inside the iframe", async ({
  page,
}) => {
  await page.goto(templatePath);
  await waitForPreview(page);
  await page.getByLabel("Submission result").selectOption("failure");
  const frame = await waitForPreview(page);

  await completeForm(frame);
  await frame.getByRole("button", { name: "Submit" }).click();

  await expect(
    frame.getByRole("heading", { name: "We could not send your message" }),
  ).toBeVisible();
  await expect(frame.getByLabel("First name")).toHaveValue("Avery");
  await expect(frame.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("keeps post-idle iframe activity local, ephemeral, and navigation-free", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const tracker = { beforeUnload: 0, history: 0 };
    const addEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function patchedAddEventListener(
      type,
      ...rest
    ) {
      if (type === "beforeunload") tracker.beforeUnload += 1;
      return addEventListener.call(this, type, ...rest);
    };
    for (const method of ["pushState", "replaceState"] as const) {
      const original = history[method];
      history[method] = function patchedHistory(...args) {
        tracker.history += 1;
        return original.apply(this, args);
      };
    }
    Object.defineProperty(window, "__formmusePreviewTracker", {
      configurable: false,
      value: tracker,
    });
  });

  const laterRequests: string[] = [];
  let observeLaterRequests = false;
  page.on("request", (request) => {
    if (observeLaterRequests) laterRequests.push(request.url());
  });

  await page.goto(templatePath);
  const frame = await waitForPreview(page);
  await page.waitForLoadState("networkidle");
  const before = await previewContent(page);
  const initialState = await before.evaluate(async () => ({
    cacheKeys: await caches.keys(),
    cookies: document.cookie,
    historyLength: history.length,
    indexedDatabases: indexedDB.databases ? await indexedDB.databases() : [],
    localStorage: Object.keys(localStorage),
    serviceWorkers: await navigator.serviceWorker.getRegistrations(),
    sessionStorage: Object.keys(sessionStorage),
    tracker: window.__formmusePreviewTracker,
  }));

  observeLaterRequests = true;
  await completeForm(frame);
  await frame.getByRole("button", { name: "Submit" }).click();
  await expect(
    frame.getByRole("heading", { name: "Message sent" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Replay" }).click();
  await page.getByRole("button", { name: "Reset" }).click();
  const resetFrame = await waitForPreview(page);
  await resetFrame.getByLabel("First name").scrollIntoViewIfNeeded();

  const after = await previewContent(page);
  const finalState = await after.evaluate(async () => ({
    cacheKeys: await caches.keys(),
    cookies: document.cookie,
    historyLength: history.length,
    indexedDatabases: indexedDB.databases ? await indexedDB.databases() : [],
    localStorage: Object.keys(localStorage),
    serviceWorkers: await navigator.serviceWorker.getRegistrations(),
    sessionStorage: Object.keys(sessionStorage),
    tracker: window.__formmusePreviewTracker,
  }));

  expect(initialState.cacheKeys).toEqual([]);
  expect(initialState.cookies).toBe("");
  expect(initialState.indexedDatabases).toEqual([]);
  expect(initialState.localStorage).toEqual([]);
  expect(initialState.serviceWorkers).toEqual([]);
  expect(initialState.sessionStorage).toEqual([]);
  expect(initialState.tracker.beforeUnload).toBe(0);
  expect(finalState).toEqual(initialState);
  expect(
    laterRequests.filter(
      (url) =>
        new URL(url).origin !== page.url().match(/^https?:\/\/[^/]+/)?.[0],
    ),
  ).toEqual([]);
  const expectedPreviewPath = new URL(previewPath, page.url()).pathname.replace(
    /\/$/,
    "",
  );
  expect(
    laterRequests.filter((url) => {
      const parsed = new URL(url);
      return !(
        parsed.pathname === expectedPreviewPath ||
        parsed.pathname.startsWith("/formmuse/hanging-gifts-contact/") ||
        parsed.pathname.startsWith("/_next/static/")
      );
    }),
  ).toEqual([]);
});

test("navigates the current static routes without page or console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await page
    .getByRole("link", { name: "Open Hanging Gifts template route" })
    .click();
  await expect(page).toHaveURL(new RegExp(`${templatePath}$`));
  await waitForPreview(page);
  await page.goto(previewPath);
  await expect(
    page.getByRole("heading", { name: "Let's Talk Gifting." }),
  ).toBeVisible();

  expect(errors).toEqual([]);
});
