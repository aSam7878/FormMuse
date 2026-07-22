# FormMuse V1 Launch Collection Planning

This document records fixed launch-planning rules and a non-binding concept inspiration bank. It is not a roster of templates FormMuse has committed to build.

## Fixed planning slots

| Primary category | Planning IDs | Single-step | Multi-step | Total |
| --- | --- | ---: | ---: | ---: |
| Contact | `C01`–`C10` | 9 | 1 intentionally conversational | 10 |
| Newsletter | `N01`–`N05` | 5 | 0 | 5 |
| Quote request | `Q01`–`Q05` | 2 | 3 | 5 |
| **Total** |  | **16** | **4** | **20** |

Template Planning IDs are permanent repository-side slots, not public identities. The project owner chooses what to create according to their taste when a slot is ready to begin. Only that explicit choice activates a concept and creates its directional Launch Brief. Names and slugs remain provisional during draft work; the Canonical Slug becomes immutable only at publication.

Every selected concept must still follow the shared rules:

- Broadly reusable premium visual concept rather than an industry-locked product.
- Meaningfully distinct from every existing and assigned template.
- Category and Interaction Depth allocation shown above.
- Complete provider-agnostic form behavior and the shared FormMuse API.
- Portable, accessible, responsive, reduced-motion-safe implementation.
- No unapproved provider, backend, asset, or framework dependency.
- Full publication quality gate before it counts toward the launch collection.

## Activated launch briefs

### C01 — Hanging Gifts

- **Planning state:** Active draft assigned to the permanent repository-side `C01` contact slot.
- **Public identity:** Working title “Hanging Gifts” with `hanging-gifts-contact` as its candidate draft slug. The slug remains deliberately changeable while the template is a draft and becomes the immutable Canonical Slug only when the template is published.
- **Purpose:** Give a visitor a complete, high-touch contact experience for describing a gifting inquiry and connecting it to an adopter-owned submission backend.
- **Audience Lens:** A visitor seeking tailored gifting guidance from a broadly reusable service business, using corporate and business gifts, events and special occasions, and custom requirements as replaceable demo scenarios rather than supported-industry limits.
- **Approved visual concept:** A cinematic, page-scale light composition moves from a darkened photographic gift hero into a warm paper surface crossed by individually suspended forest-green and ember-orange gifts. The inquiry copy and a softly translucent form card sit together as the central decision point, followed by alternative contact cards.
- **Complete Composition:** The distributed boundary contains the responsive template navigation, full-viewport hero, hanging-gift transition, inquiry and social-placeholder content, single-step form with submitting, failure, and success states, and the three “Other ways to connect” cards. FormMuse preview chrome and the deterministic submission adapter remain outside this boundary.
- **Core fields:** Required first name, requirement, email address, and message; optional last name. The requirement choices are corporate and business gifting, events and special occasions, and custom requirements.
- **Interaction Depth:** Single-step. All fields remain directly visible and submit together; the immersive page scale and animation do not justify a Step Flow.
- **Objective appearance:** `light`, using a fixed template-scoped forest, ember, paper, ink, and error palette.
- **Primary interaction and animation:** GSAP coordinates the replayable hero/form entrance and one-shot scroll reveal of supporting cards; Motion supplies hanging-gift sway, form-card tilt, in-view movement, and animated contact icons; scoped CSS supplies the gift sparkles and responsive composition. Reduced motion removes choreography and continuous decorative movement without removing content or states.
- **Asset and dependency requirements:** The template owns the local `hanging-gifts-hero.svg` transport wrapper and its approved embedded raster, plus the concept-essential Mulish variable font package. It requires the local shadcn Button, Input, Label, Select, and Textarea controls; React Hook Form, Zod, and the Zod resolver; Motion; GSAP, `@gsap/react`, and ScrollTrigger; Lucide icons; and its colocated CSS Module. It requires no remote asset, provider integration, FormMuse backend, or template-initiated network request.

#### C01 uniqueness guardrails

Future nearest-template briefs must record at least three material differences from C01. Changing only copy, field labels, or palette is insufficient when the following package remains recognizable:

1. C01 opens with a full-viewport local photographic gift scene and a sticky cinematic transition into a raised paper form surface.
2. Six illustrated hanging gifts, alternating forest and ember colors, form a swaying and sparkling curtain that physically bridges the hero and inquiry sections.
3. The central interaction pairs editorial inquiry copy with a softly translucent, pointer-tilting form card before continuing into three animated alternative-contact cards.
4. Its motion identity deliberately layers coordinated GSAP entrance/scroll choreography, Motion-driven object and card interactions, and long-running scoped CSS sparkles while preserving a complete reduced-motion presentation.

## Non-binding concept examples

The following names and ideas are examples of the creative range agents may explore. None is approved, assigned to a Planning ID, guaranteed a place in V1, or required to be built. They may be changed, combined, ignored, or replaced entirely.

### Contact examples

- **Postmarked Letter** — premium stationery, postmark details, and a sealed-message success treatment.
- **Midnight Signal** — dark signal rings and transmission feedback that respond to field focus.
- **Editorial Index** — restrained magazine-like hierarchy, rules, numbering, and generous whitespace.
- **Botanical Frame** — original line-drawn leaves forming a responsive engraved border.
- **Kinetic Mosaic** — bold geometric tiles choreographed around the form.
- **Tidal Glass** — slow translucent contour layers behind a grounded readable surface.
- **Monochrome Spotlight** — dramatic scale, high contrast, and controlled stage-light movement.
- **Sculpted Arch** — architectural arches and quiet mineral surfaces framing the form.
- **Guided Conversation** — an accessible multi-step exchange without chatbot or AI behavior.

### Newsletter examples

- **Issue Zero** — a typographic masthead and first-issue editorial subscription treatment.
- **Aurora Dispatch** — a one-field dark signup beneath a controlled luminous atmosphere.
- **Confetti Capsule** — a compact signup with a bounded success-only geometric celebration.
- **Terminal Dispatch** — a refined technical transcript around a conventional accessible email field.
- **Quiet Echo** — an intentionally minimal field with a brief line-based focus or success echo.

### Quote-request examples

- **Scope Blueprint** — project details progressively complete original drafting linework.
- **Material Swatches** — accessible service and budget choices presented as tactile CSS-authored samples.
- **Milestone Path** — multi-step project details advance along a responsive visual route.
- **Estimate Ledger** — a clear single-page request organized like a refined estimate sheet without calculating prices.
- **Proposal Stack** — grouped request steps move through layered proposal sheets.

These examples are useful for discussing originality and range only. When beginning a real template, start from the project owner's selected idea—even when it does not resemble anything listed here—and create a fresh Launch Brief under the chosen Planning ID.
