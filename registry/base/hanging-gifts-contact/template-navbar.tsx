"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import styles from "./hanging-gifts-contact-form.module.css";

const navLabels = ["Home", "About Us", "Our Products", "Contact Us"] as const;

export function TemplateNavbar() {
  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLSpanElement>(null);
  const middleBarRef = useRef<HTMLSpanElement>(null);
  const bottomBarRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const footerRef = useRef<HTMLDivElement>(null);
  const animateMenuRef = useRef<(open: boolean) => void>(() => undefined);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateScrolledState = () => setScrolled(window.scrollY > 50);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  useGSAP(
    (_context, contextSafe) => {
      if (!contextSafe) return;

      animateMenuRef.current = contextSafe((open: boolean) => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        gsap.killTweensOf([
          topBarRef.current,
          middleBarRef.current,
          bottomBarRef.current,
          ...linkRefs.current,
          footerRef.current,
        ]);

        if (open) {
          gsap.fromTo(
            linkRefs.current.filter(Boolean),
            { y: 50, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: reduceMotion ? 0 : 0.45,
              stagger: reduceMotion ? 0 : 0.07,
              delay: reduceMotion ? 0 : 0.25,
              ease: "power3.out",
            },
          );
          gsap.fromTo(
            footerRef.current,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: reduceMotion ? 0 : 0.4,
              delay: reduceMotion ? 0 : 0.5,
            },
          );
        }

        gsap.to(topBarRef.current, {
          y: open ? 8 : 0,
          rotation: open ? 45 : 0,
          duration: reduceMotion ? 0 : 0.35,
        });
        gsap.to(middleBarRef.current, {
          opacity: open ? 0 : 1,
          scaleX: open ? 0 : 1,
          duration: reduceMotion ? 0 : 0.2,
        });
        gsap.to(bottomBarRef.current, {
          y: open ? -8 : 0,
          rotation: open ? -45 : 0,
          duration: reduceMotion ? 0 : 0.35,
        });
      });

      return () => {
        animateMenuRef.current = () => undefined;
      };
    },
    { scope: rootRef },
  );

  const toggleMenu = () => {
    const nextOpen = !menuOpen;
    setMenuOpen(nextOpen);
    animateMenuRef.current(nextOpen);
  };

  return (
    <header ref={rootRef}>
      <div
        data-formmuse-navbar
        data-scrolled={scrolled ? "true" : "false"}
        className={`${styles.navbar} ${scrolled && !menuOpen ? styles.navbarScrolled : ""}`}
      >
        <div className={styles.navbarInner}>
          <span
            className={`${styles.logoPlaceholder} ${scrolled && !menuOpen ? styles.logoScrolled : ""} ${menuOpen ? styles.logoHidden : ""}`}
          >
            Logo
          </span>

          <nav
            aria-label="Template navigation"
            className={styles.desktopNavigation}
          >
            {navLabels.map((label, index) => (
              <span
                key={label}
                className={`${styles.desktopNavigationItem} ${index === 3 ? styles.desktopNavigationCurrent : ""} ${scrolled ? styles.desktopNavigationItemScrolled : ""}`}
              >
                {label.toUpperCase()}
              </span>
            ))}
          </nav>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={styles.menuButton}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="hanging-gifts-mobile-navigation"
            onClick={toggleMenu}
          >
            <span
              ref={topBarRef}
              className={`${styles.menuBar} ${menuOpen || !scrolled ? styles.menuBarLight : styles.menuBarDark}`}
            />
            <span
              ref={middleBarRef}
              className={`${styles.menuBar} ${styles.menuBarGap} ${menuOpen || !scrolled ? styles.menuBarLight : styles.menuBarDark}`}
            />
            <span
              ref={bottomBarRef}
              className={`${styles.menuBar} ${styles.menuBarGap} ${menuOpen || !scrolled ? styles.menuBarLight : styles.menuBarDark}`}
            />
          </Button>
        </div>
      </div>

      <div
        ref={overlayRef}
        id="hanging-gifts-mobile-navigation"
        className={`${styles.mobileNavigationOverlay} ${menuOpen ? styles.mobileNavigationOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobileNavigationGlowTop} />
        <div className={styles.mobileNavigationGlowBottom} />
        <div className={styles.mobileNavigationContent}>
          <nav
            aria-label="Template mobile navigation"
            className={styles.mobileNavigationLinks}
          >
            {navLabels.map((label, index) => (
              <button
                key={label}
                ref={(element) => {
                  linkRefs.current[index] = element;
                }}
                type="button"
                tabIndex={menuOpen ? 0 : -1}
                className={styles.mobileNavigationLink}
                onClick={toggleMenu}
              >
                <span className={styles.mobileNavigationNumber}>
                  0{index + 1}
                </span>
                <span className={styles.mobileNavigationLabel}>{label}</span>
                <span
                  aria-hidden="true"
                  className={styles.mobileNavigationArrow}
                >
                  →
                </span>
              </button>
            ))}
          </nav>

          <div ref={footerRef} className={styles.mobileNavigationFooter}>
            <p>+1 (555) 014-0286&nbsp;&nbsp;|&nbsp;&nbsp;hello@example.com</p>
            <p className={styles.mobileNavigationCopyright}>
              Demo contact details
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
