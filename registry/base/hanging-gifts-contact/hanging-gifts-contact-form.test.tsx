import type { ReactNode } from "react";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { HangingGiftsContactForm } from "./hanging-gifts-contact-form";

const gsapMocks = vi.hoisted(() => ({
  from: vi.fn(),
  fromTo: vi.fn(),
  killTweensOf: vi.fn(),
  matchMediaRevert: vi.fn(),
  set: vi.fn(),
  timeline: vi.fn(),
  timelineFromTo: vi.fn(),
  to: vi.fn(),
}));

vi.mock("@gsap/react", async () => {
  const React = await import("react");

  return {
    useGSAP: (
      callback: (...args: unknown[]) => void | (() => void),
      config?: { dependencies?: unknown[] },
    ) => {
      // The mock intentionally mirrors useGSAP's caller-supplied dependency contract.
      React.useEffect(
        () => callback(undefined, (value: unknown) => value),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        config?.dependencies ?? [],
      );
    },
  };
});

vi.mock("gsap", () => {
  const timeline = {
    fromTo: (...args: unknown[]) => {
      gsapMocks.timelineFromTo(...args);
      return timeline;
    },
  };
  gsapMocks.timeline.mockImplementation(() => timeline);

  return {
    default: {
      from: gsapMocks.from,
      fromTo: gsapMocks.fromTo,
      killTweensOf: gsapMocks.killTweensOf,
      matchMedia: () => ({
        add: (
          _conditions: unknown,
          callback: (context: {
            conditions: { reduceMotion: boolean };
          }) => void,
        ) => callback({ conditions: { reduceMotion: false } }),
        revert: gsapMocks.matchMediaRevert,
      }),
      registerPlugin: () => undefined,
      set: gsapMocks.set,
      timeline: gsapMocks.timeline,
      to: gsapMocks.to,
    },
  };
});

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();

  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const completeDefaults = {
  firstName: "Avery",
  lastName: "Stone",
  requirement: "corporate",
  email: "avery@example.com",
  message: "I would like to discuss a thoughtful gifting project.",
};

function deferredPromise() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function submitButton() {
  return screen.getByRole("button", { name: "Submit" });
}

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      window.setTimeout(() => callback(0), 0);
      return 1;
    },
  });
});

afterEach(() => cleanup());

beforeEach(() => {
  Object.values(gsapMocks).forEach((mock) => mock.mockClear());
});

describe("HangingGiftsContactForm", () => {
  it("renders synchronized labels, requirement markers, and native limits", () => {
    render(
      <HangingGiftsContactForm
        defaultValues={completeDefaults}
        onSubmit={async () => undefined}
      />,
    );

    const firstName = screen.getByLabelText("First name");
    const lastName = screen.getByLabelText(/Last name/);
    const requirement = screen.getByLabelText("Requirement");
    const email = screen.getByLabelText("Email address");
    const message = screen.getByLabelText("Message");

    expect(firstName).toBeRequired();
    expect(lastName).not.toBeRequired();
    expect(requirement).toHaveAttribute("aria-required", "true");
    expect(email).toBeRequired();
    expect(message).toBeRequired();
    expect(firstName).toHaveAttribute("maxlength", "80");
    expect(firstName).toHaveAttribute("autocomplete", "given-name");
    expect(lastName).toHaveAttribute("maxlength", "80");
    expect(lastName).toHaveAttribute("autocomplete", "family-name");
    expect(email).toHaveAttribute("maxlength", "254");
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(message).toHaveAttribute("maxlength", "1200");
    expect(
      screen.getByText("All fields are required unless marked optional."),
    ).toBeInTheDocument();
  });

  it("uses submit-first validation and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => undefined);
    render(<HangingGiftsContactForm onSubmit={onSubmit} />);

    await user.click(submitButton());

    expect(
      await screen.findByText("Enter your first name."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed values and preserves message formatting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => undefined);
    render(
      <HangingGiftsContactForm
        defaultValues={{
          ...completeDefaults,
          firstName: "  Avery  ",
          lastName: "  Stone  ",
          email: "  avery@example.com  ",
          message: "  Keep this opening.\nAnd this ending.  ",
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.click(submitButton());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      firstName: "Avery",
      lastName: "Stone",
      requirement: "corporate",
      email: "avery@example.com",
      message: "  Keep this opening.\nAnd this ending.  ",
    });
    expect(await screen.findByText("Message sent")).toHaveFocus();
  });

  it("allows only one promise while submission is pending", async () => {
    const pending = deferredPromise();
    const onSubmit = vi.fn(() => pending.promise);
    render(
      <HangingGiftsContactForm
        defaultValues={completeDefaults}
        onSubmit={onSubmit}
      />,
    );
    const form = submitButton().closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Sending your message…")).toBeInTheDocument();
    pending.resolve();
    expect(await screen.findByText("Message sent")).toBeInTheDocument();
  });

  it("preserves values, hides raw errors, and retries only on explicit action", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("private backend detail"))
      .mockResolvedValueOnce(undefined);
    render(
      <HangingGiftsContactForm
        defaultValues={completeDefaults}
        onSubmit={onSubmit}
      />,
    );

    await user.click(submitButton());
    const failureHeading = await screen.findByText(
      "We could not send your message",
    );

    expect(failureHeading).toHaveFocus();
    expect(
      screen.queryByText("private backend detail"),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveValue("Avery");
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Message sent")).toHaveFocus();
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("keeps success persistent and resets to the original initial snapshot", async () => {
    const user = userEvent.setup();
    render(
      <HangingGiftsContactForm
        defaultValues={completeDefaults}
        onSubmit={async () => undefined}
      />,
    );

    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "Edited");
    await user.click(submitButton());

    expect(await screen.findByText("Message sent")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Submit" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Send another" }));

    expect(screen.getByLabelText("First name")).toHaveValue("Avery");
    await waitFor(() =>
      expect(screen.getByLabelText("First name")).toHaveFocus(),
    );
  });

  it("treats defaultValues as initial-only", async () => {
    const user = userEvent.setup();
    const onSubmit = async () => undefined;
    const { rerender } = render(
      <HangingGiftsContactForm
        defaultValues={completeDefaults}
        onSubmit={onSubmit}
      />,
    );

    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "Edited");
    rerender(
      <HangingGiftsContactForm
        defaultValues={{ ...completeDefaults, firstName: "Replacement" }}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText("First name")).toHaveValue("Edited");
  });

  it("applies className only to the outer root and normalizes assetBaseUrl", () => {
    const { container } = render(
      <HangingGiftsContactForm
        className="adopter-placement"
        assetBaseUrl="/tenant/assets/"
        defaultValues={completeDefaults}
        onSubmit={async () => undefined}
      />,
    );
    const root = container.querySelector("[data-formmuse-template]");
    const hero = root?.querySelector("img");

    expect(root).toHaveClass("adopter-placement");
    expect(root?.querySelectorAll(".adopter-placement")).toHaveLength(0);
    expect(hero).toHaveAttribute(
      "src",
      "/tenant/assets/hanging-gifts-hero.svg",
    );
    expect(hero).toHaveAttribute("alt", "");
    expect(hero).toHaveAttribute("width", "1536");
    expect(hero).toHaveAttribute("height", "1024");
  });

  it("uses generic Lucide social placeholders without changing the phone icon", () => {
    render(
      <HangingGiftsContactForm
        defaultValues={completeDefaults}
        onSubmit={async () => undefined}
      />,
    );

    expect(
      screen
        .getByRole("img", { name: "Social sharing placeholder" })
        .querySelector("svg"),
    ).toHaveClass("lucide-share-2");
    expect(
      screen
        .getByRole("img", { name: "Photo sharing placeholder" })
        .querySelector("svg"),
    ).toHaveClass("lucide-camera");
    expect(
      screen
        .getByRole("img", { name: "Phone placeholder" })
        .querySelector("svg"),
    ).toHaveClass("lucide-phone");

    for (const label of [
      "Social sharing placeholder",
      "Photo sharing placeholder",
      "Phone placeholder",
    ]) {
      expect(screen.getByRole("img", { name: label })).toHaveClass(
        "flex",
        "size-14",
        "items-center",
        "justify-center",
        "rounded-full",
        "border",
        "bg-white",
        "transition-all",
        "duration-300",
        "hover:scale-110",
      );
    }
  });

  it("replays only when the animation key changes without resetting validation or identity", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => undefined);
    const { container, rerender } = render(
      <HangingGiftsContactForm animationReplayKey={0} onSubmit={onSubmit} />,
    );

    await waitFor(() => expect(gsapMocks.timeline).toHaveBeenCalledTimes(1));
    expect(gsapMocks.from).toHaveBeenCalledTimes(2);

    const root = container.querySelector("[data-formmuse-template]");
    const firstName = screen.getByLabelText("First name");
    await user.click(submitButton());
    expect(await screen.findByText("Enter your first name.")).toBeVisible();
    expect(firstName).toHaveFocus();

    rerender(
      <HangingGiftsContactForm animationReplayKey={0} onSubmit={onSubmit} />,
    );
    expect(gsapMocks.timeline).toHaveBeenCalledTimes(1);
    expect(gsapMocks.from).toHaveBeenCalledTimes(2);
    expect(container.querySelector("[data-formmuse-template]")).toBe(root);
    expect(screen.getByLabelText("First name")).toBe(firstName);
    expect(screen.getByText("Enter your first name.")).toBeVisible();
    expect(firstName).toHaveFocus();

    rerender(
      <HangingGiftsContactForm animationReplayKey={1} onSubmit={onSubmit} />,
    );
    await waitFor(() => expect(gsapMocks.timeline).toHaveBeenCalledTimes(2));
    expect(gsapMocks.from).toHaveBeenCalledTimes(2);
    expect(container.querySelector("[data-formmuse-template]")).toBe(root);
    expect(screen.getByLabelText("First name")).toBe(firstName);
    expect(screen.getByText("Enter your first name.")).toBeVisible();
    expect(firstName).toHaveFocus();
  });

  it("preserves pending, failure, success, values, and focus across replay keys", async () => {
    const user = userEvent.setup();
    const pending = deferredPromise();
    const onSubmit = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => pending.promise)
      .mockResolvedValueOnce(undefined);
    const { container, rerender } = render(
      <HangingGiftsContactForm
        animationReplayKey={0}
        defaultValues={completeDefaults}
        onSubmit={onSubmit}
      />,
    );
    const root = container.querySelector("[data-formmuse-template]");
    const firstName = screen.getByLabelText("First name");
    const form = submitButton().closest("form") as HTMLFormElement;

    firstName.focus();
    fireEvent.submit(form);
    await waitFor(() => expect(form).toHaveAttribute("aria-busy", "true"));
    rerender(
      <HangingGiftsContactForm
        animationReplayKey={1}
        defaultValues={completeDefaults}
        onSubmit={onSubmit}
      />,
    );
    expect(container.querySelector("[data-formmuse-template]")).toBe(root);
    expect(screen.getByLabelText("First name")).toBe(firstName);
    expect(firstName).toHaveValue("Avery");
    expect(form).toHaveAttribute("aria-busy", "true");
    expect(firstName).toHaveFocus();

    await act(async () => pending.reject(new Error("Preview failure")));
    const failureHeading = await screen.findByRole("heading", {
      name: "We could not send your message",
    });
    expect(failureHeading).toHaveFocus();
    rerender(
      <HangingGiftsContactForm
        animationReplayKey={2}
        defaultValues={completeDefaults}
        onSubmit={onSubmit}
      />,
    );
    expect(container.querySelector("[data-formmuse-template]")).toBe(root);
    expect(screen.getByLabelText("First name")).toBe(firstName);
    expect(firstName).toHaveValue("Avery");
    expect(failureHeading).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    const successHeading = await screen.findByRole("heading", {
      name: "Message sent",
    });
    expect(successHeading).toHaveFocus();
    rerender(
      <HangingGiftsContactForm
        animationReplayKey={3}
        defaultValues={completeDefaults}
        onSubmit={onSubmit}
      />,
    );
    expect(container.querySelector("[data-formmuse-template]")).toBe(root);
    expect(screen.getByRole("heading", { name: "Message sent" })).toBe(
      successHeading,
    );
    expect(successHeading).toHaveFocus();
  });

  it("uses unique field and mobile-navigation IDs across two instances", () => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <section>{children}</section>
    );
    render(
      <>
        <Wrapper>
          <HangingGiftsContactForm
            defaultValues={completeDefaults}
            onSubmit={async () => undefined}
          />
        </Wrapper>
        <Wrapper>
          <HangingGiftsContactForm
            defaultValues={completeDefaults}
            onSubmit={async () => undefined}
          />
        </Wrapper>
      </>,
    );

    const firstNames = screen.getAllByLabelText("First name");
    expect(firstNames[0].id).not.toBe(firstNames[1].id);

    const menuButtons = screen.getAllByRole("button", {
      name: "Open navigation",
    });
    const controlledIds = menuButtons.map((button) =>
      button.getAttribute("aria-controls"),
    );
    expect(new Set(controlledIds).size).toBe(2);
    controlledIds.forEach((id) => {
      expect(id).not.toBeNull();
      expect(document.getElementById(id as string)).toBeInTheDocument();
    });

    const roots = screen.getAllByText(
      "All fields are required unless marked optional.",
    );
    roots.forEach((description) => {
      expect(
        within(description.closest("form") as HTMLFormElement).getByLabelText(
          "Message",
        ),
      ).toBeInTheDocument();
    });
  });
});
