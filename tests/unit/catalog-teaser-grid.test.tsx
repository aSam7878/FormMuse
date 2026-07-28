import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CATALOG_TEASER_MAX_MOUNTED,
  CATALOG_TEASER_ROOT_MARGIN,
  CatalogTeaserGrid,
} from "../../components/catalog/catalog-teaser-grid";

const items = Array.from({ length: 20 }, (_, index) => ({
  title: `Hanging Gifts ${index + 1}`,
  description: "A representative catalog teaser.",
  templatePath: `/templates/hanging-gifts-${index + 1}`,
  previewPath: "/preview/hanging-gifts-contact",
  previewOrigin: "https://preview.formmuse.test",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("measured Catalog Teaser lifecycle", () => {
  it("keeps the fallback when observation is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<CatalogTeaserGrid items={items} />);
    expect(container.querySelectorAll("article")).toHaveLength(20);
    expect(container.querySelectorAll("iframe")).toHaveLength(0);
  });

  it("mounts at most three nearby previews and unmounts off-screen visits", () => {
    let callback: IntersectionObserverCallback = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    class Observer {
      constructor(nextCallback: IntersectionObserverCallback, options: object) {
        callback = nextCallback;
        expect(options).toEqual({
          rootMargin: CATALOG_TEASER_ROOT_MARGIN,
          threshold: 0,
        });
      }
      observe = observe;
      disconnect = disconnect;
    }
    vi.stubGlobal("IntersectionObserver", Observer);
    vi.stubGlobal("innerHeight", 900);
    const { container, unmount } = render(<CatalogTeaserGrid items={items} />);
    expect(observe).toHaveBeenCalledTimes(20);

    const slots = [
      ...container.querySelectorAll<HTMLElement>("[data-catalog-teaser-index]"),
    ];
    const bounds = slots.map((slot, index) =>
      vi.spyOn(slot, "getBoundingClientRect").mockReturnValue({
        top: index * 320,
        bottom: index * 320 + 300,
      } as DOMRect),
    );
    const entries = slots.slice(0, 8).map(
      (target, index) =>
        ({
          target,
          isIntersecting: true,
          boundingClientRect: {
            top: index * 320,
            bottom: index * 320 + 300,
          },
        }) as unknown as IntersectionObserverEntry,
    );
    act(() => callback(entries, {} as IntersectionObserver));
    expect(container.querySelectorAll("iframe")).toHaveLength(
      CATALOG_TEASER_MAX_MOUNTED,
    );
    const firstFrame = container.querySelector("iframe");

    act(() =>
      callback(
        entries.slice(0, 3).map(
          (entry) =>
            ({
              ...entry,
              isIntersecting: false,
            }) as IntersectionObserverEntry,
        ),
        {} as IntersectionObserver,
      ),
    );
    expect(container.querySelectorAll("iframe")).toHaveLength(3);
    expect(firstFrame?.isConnected).toBe(false);

    bounds[0]!.mockReturnValue({
      top: 0,
      bottom: 300,
    } as DOMRect);
    act(() => callback([entries[0]!], {} as IntersectionObserver));
    expect(container.querySelectorAll("iframe")).toHaveLength(3);
    expect(container.querySelector("iframe")).not.toBe(firstFrame);

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
