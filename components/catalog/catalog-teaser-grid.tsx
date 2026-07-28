"use client";

import { useEffect, useRef, useState } from "react";

import {
  CatalogTeaser,
  type CatalogTeaserProps,
} from "@/components/catalog/catalog-teaser";

export const CATALOG_TEASER_ROOT_MARGIN = "600px 0px";
export const CATALOG_TEASER_MAX_MOUNTED = 3;

type Candidate = Readonly<{
  index: number;
  top: number;
  bottom: number;
}>;

export function selectCatalogTeaserIndexes(
  candidates: readonly Candidate[],
  viewportHeight: number,
): number[] {
  return [...candidates]
    .sort((left, right) => {
      const leftDistance =
        left.bottom > 0 && left.top < viewportHeight
          ? 0
          : Math.min(
              Math.abs(left.bottom),
              Math.abs(left.top - viewportHeight),
            );
      const rightDistance =
        right.bottom > 0 && right.top < viewportHeight
          ? 0
          : Math.min(
              Math.abs(right.bottom),
              Math.abs(right.top - viewportHeight),
            );
      return leftDistance - rightDistance || left.index - right.index;
    })
    .slice(0, CATALOG_TEASER_MAX_MOUNTED)
    .map(({ index }) => index);
}

export function CatalogTeaserGrid({
  items,
}: Readonly<{
  items: readonly Omit<CatalogTeaserProps, "active">[];
}>) {
  const elementsRef = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndexes, setActiveIndexes] = useState<readonly number[]>([]);

  useEffect(() => {
    if (typeof window.IntersectionObserver !== "function") return;
    const candidates = new Map<number, HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            (entry.target as HTMLElement).dataset.catalogTeaserIndex,
          );
          if (!Number.isInteger(index)) continue;
          if (entry.isIntersecting) {
            candidates.set(index, entry.target as HTMLElement);
          } else {
            candidates.delete(index);
          }
        }
        setActiveIndexes(
          selectCatalogTeaserIndexes(
            [...candidates].map(([index, element]) => {
              const bounds = element.getBoundingClientRect();
              return { index, top: bounds.top, bottom: bounds.bottom };
            }),
            innerHeight,
          ),
        );
      },
      { rootMargin: CATALOG_TEASER_ROOT_MARGIN, threshold: 0 },
    );
    for (const element of elementsRef.current) {
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <div data-catalog-teaser-grid="measured-lifecycle">
      {items.map((item, index) => (
        <div
          key={`${item.templatePath}-${index}`}
          ref={(element) => {
            elementsRef.current[index] = element;
          }}
          data-catalog-teaser-index={index}
        >
          <CatalogTeaser {...item} active={activeIndexes.includes(index)} />
        </div>
      ))}
    </div>
  );
}
