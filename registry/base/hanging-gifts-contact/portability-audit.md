# Hanging Gifts portability, animation, and typography audit

This repository-only record applies to the draft `hanging-gifts-contact` Registry Record and the owner-approved C01 Launch Brief. It is not part of the distributed Template Block.

## Portable source boundary

- The distributed inventory contains five template-owned TypeScript/TSX modules, one scoped CSS Module, and the local public hero SVG. Every template-owned import is relative; adopter aliases are limited to the declared shadcn controls and `cn`.
- The component uses client-side React, a standard `<img>` with explicit dimensions, and root-relative asset resolution. It imports no Next.js module, router, server API, direct Base UI primitive, remote asset, or FormMuse website module.
- The CSS Module owns the template palette, container queries, keyframes, and Mulish application beneath `.root`. It contains no `:root`, `html`, `body`, `:global`, runtime style injection, or adopter-wide typography override.
- Registry validation rejects undeclared imports, undeclared assets, direct Base UI imports, Next.js packages, remote runtime references, global CSS Module selectors, and repository-only Markdown, preview, example, and test files.

## Animation dependency decisions

- **Scoped CSS — keep.** The four slug-prefixed sparkle keyframes, responsive composition, and simple transitions are local CSS concerns. The reduced-motion media query removes sparkle loops and template transitions without hiding content.
- **Motion — keep.** Motion owns React-aware hanging-gift sway, form-card pointer tilt, in-view inquiry movement, result-state presence, and imperative contact-icon interaction. Each path uses `useReducedMotion`; the continuous gift loop becomes a zero-duration static state.
- **GSAP and `@gsap/react` — keep.** A GSAP timeline coordinates the replayable hero-to-form entrance, ScrollTrigger supplies the one-shot supporting-section reveals, and the mobile navigation uses interruptible sequenced transforms. These are concept-level choreography rather than generic isolated fades. `useGSAP` scopes selectors and reverts animations on unmount; delayed navigation handlers are wrapped with `contextSafe`.
- **ScrollTrigger — keep as part of GSAP.** It is used only for the two one-shot, top-to-bottom supporting-section reveals. Triggers are created in document order, use no pinning or scrub, and are cleaned up by the enclosing `useGSAP` context.
- **Reduced motion — pass.** `gsap.matchMedia` exposes the final entrance and scroll content immediately, Motion disables continuous and large movement, navigation durations become zero, and the CSS media query removes loops and transitions.
- **Performance — pass.** Choreography uses transforms and `autoAlpha`; ScrollTriggers run once; `will-change` is limited to the continuously swaying gifts and pointer-tilting form card. No animation changes layout properties or creates unbounded trigger collections.

## Mulish exceptional-font decision

- **Decision: keep `@fontsource-variable/mulish@5.3.0`.** The approved C01 brief identifies Mulish as concept-essential, and its rounded metrics are part of the locked composition. Replacing it would be a visible typography change requiring new owner approval.
- The installed package is version-pinned, includes the SIL Open Font License 1.1 and copyright notice, and permits bundling and redistribution subject to preserving that licence. Detailed provenance remains in `asset-provenance.md`.
- `import "@fontsource-variable/mulish"` bundles the font through the adopter's build with no remote request. The CSS Module applies `"Mulish Variable"` only beneath the template root and provides `Mulish`, `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks.
- Existing Next.js and Vite production-build evidence exercises the same package import. The Registry Record declares the font only for this template; removing FormMuse website dependencies does not remove it.
- Manual Installation must surface the pinned package, local loading behavior, OFL notice, root-scoped application, and fallback stack before publication.

## Result

All current animation and font dependencies have a material template-owned use and remain declared. No source, dependency, or visible typography change is required by this audit.
