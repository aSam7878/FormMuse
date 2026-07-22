import type { ReactNode } from "react";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { HangingGiftsContactForm } from "./hanging-gifts-contact-form";

vi.mock("@gsap/react", () => ({
  useGSAP: () => undefined,
}));

vi.mock("gsap", () => ({
  default: {
    registerPlugin: () => undefined,
  },
}));

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
    expect(lastName).toHaveAttribute("maxlength", "80");
    expect(email).toHaveAttribute("maxlength", "254");
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

    expect(root).toHaveClass("adopter-placement");
    expect(root?.querySelectorAll(".adopter-placement")).toHaveLength(0);
    expect(root?.querySelector("img")).toHaveAttribute(
      "src",
      "/tenant/assets/hanging-gifts-hero.svg",
    );
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
