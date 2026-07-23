import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { TemplatePreviewFrame } from "../../components/template-page/template-preview-frame";
import { createPreviewMessage } from "../../lib/formmuse/preview-protocol";

afterEach(cleanup);

function markReady(frame: HTMLIFrameElement) {
  const source = frame.getAttribute("src");
  const channel = source
    ? new URL(source, window.location.origin).searchParams.get("channel")
    : null;
  if (!channel || !frame.contentWindow)
    throw new Error("Preview channel missing.");
  fireEvent(
    window,
    new MessageEvent("message", {
      data: createPreviewMessage(channel, "ready"),
      origin: window.location.origin,
      source: frame.contentWindow,
    }),
  );
}

describe("Template preview frame chrome", () => {
  it("embeds the isolated preview and exposes accessible viewport and outcome controls", async () => {
    const user = userEvent.setup();
    render(
      <TemplatePreviewFrame previewPath="/preview/hanging-gifts-contact" />,
    );

    const frame = screen.getByTitle(
      "Interactive Hanging Gifts template preview",
    );
    expect(frame.getAttribute("src")).toMatch(
      /^\/preview\/hanging-gifts-contact\?outcome=success&channel=fm-/,
    );
    expect(screen.getByRole("button", { name: "Desktop" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Mobile" }));
    expect(screen.getByRole("button", { name: "Mobile" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(frame.closest("[data-preview-viewport]"))?.toHaveAttribute(
      "data-preview-viewport",
      "mobile",
    );

    await user.selectOptions(
      screen.getByLabelText("Submission result"),
      "failure",
    );
    expect(
      screen
        .getByTitle("Interactive Hanging Gifts template preview")
        .getAttribute("src"),
    ).toMatch(/^\/preview\/hanging-gifts-contact\?outcome=failure&channel=fm-/);
  });

  it("distinguishes Replay requests from a full Reset remount", async () => {
    const user = userEvent.setup();
    render(
      <TemplatePreviewFrame previewPath="/preview/hanging-gifts-contact" />,
    );
    const initialFrame = screen.getByTitle(
      "Interactive Hanging Gifts template preview",
    ) as HTMLIFrameElement;
    markReady(initialFrame);

    await user.click(screen.getByRole("button", { name: "Replay" }));
    expect(
      screen.getByTitle("Interactive Hanging Gifts template preview"),
    ).toBe(initialFrame);
    expect(initialFrame.closest("[data-replay-request]"))?.toHaveAttribute(
      "data-replay-request",
      "1",
    );

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(
      screen.getByTitle("Interactive Hanging Gifts template preview"),
    ).not.toBe(initialFrame);
    expect(screen.getByRole("status", { name: "" })).toBeInTheDocument();
  });

  it("announces ready, error, and unavailable states", () => {
    const { rerender } = render(
      <TemplatePreviewFrame previewPath="/preview/hanging-gifts-contact" />,
    );
    const frame = screen.getByTitle(
      "Interactive Hanging Gifts template preview",
    ) as HTMLIFrameElement;
    markReady(frame);
    expect(
      screen.getByText("Desktop template preview ready."),
    ).toBeInTheDocument();
    fireEvent.error(frame);
    expect(screen.getByRole("alert")).toHaveTextContent("could not be loaded");

    rerender(<TemplatePreviewFrame previewPath={null} />);
    expect(
      screen.getByRole("heading", { name: "Preview unavailable" }),
    ).toBeInTheDocument();
  });
});
