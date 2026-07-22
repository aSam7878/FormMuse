import registry from "../../../registry.json";
import { createTemplateDocumentation } from "../../../lib/formmuse/template-documentation";

const registryItem = registry.items.find(
  (item) => item.name === "hanging-gifts-contact",
);

if (!registryItem) {
  throw new Error("The Hanging Gifts Registry Record is missing.");
}

export const hangingGiftsContactDocumentationInput = {
  manualInstallation: {
    files: [
      {
        path: "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.tsx",
        kind: "source",
        purpose:
          "Installs the complete contact composition, form states, replay hook, and submission boundary.",
      },
      {
        path: "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.schema.ts",
        kind: "source",
        purpose:
          "Exports the named Zod schema, parsed values type, requirement values, and complete defaults.",
      },
      {
        path: "registry/base/hanging-gifts-contact/animated-icons.tsx",
        kind: "source",
        purpose:
          "Supplies the locally rendered Motion contact icons used by the composition.",
      },
      {
        path: "registry/base/hanging-gifts-contact/hanging-gifts.tsx",
        kind: "source",
        purpose:
          "Supplies the decorative hanging-gift and sparkle artwork rendered by the hero.",
      },
      {
        path: "registry/base/hanging-gifts-contact/template-navbar.tsx",
        kind: "source",
        purpose:
          "Supplies the responsive, keyboard-operable template navigation.",
      },
      {
        path: "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.module.css",
        kind: "stylesheet",
        purpose:
          "Scopes the composition palette, container queries, keyframes, and reduced-motion rules to the template root.",
      },
      {
        path: "public/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg",
        kind: "asset",
        purpose:
          "Installs the local decorative hero artwork at the default public asset path.",
      },
    ],
    dependencies: [
      {
        dependency: "@fontsource-variable/mulish@5.3.0",
        purpose:
          "Bundles the concept-essential Mulish variable font locally under the SIL Open Font License 1.1.",
      },
      {
        dependency: "@gsap/react@2.1.2",
        purpose:
          "Scopes GSAP choreography to the React component lifecycle through useGSAP.",
      },
      {
        dependency: "@hookform/resolvers@5.4.0",
        purpose: "Connects the named Zod schema to React Hook Form validation.",
      },
      {
        dependency: "gsap@3.15.0",
        purpose:
          "Runs the replayable entrance, supporting reveals, and mobile navigation choreography.",
      },
      {
        dependency: "lucide-react@1.25.0",
        purpose:
          "Supplies the declared generic action, social-placeholder, and phone icons.",
      },
      {
        dependency: "motion@12.42.2",
        purpose:
          "Runs the React-aware gifts, pointer response, result transitions, and animated contact icons.",
      },
      {
        dependency: "react-hook-form@7.82.0",
        purpose:
          "Owns form values, validation timing, focus, and submission state.",
      },
      {
        dependency: "zod@4.4.3",
        purpose:
          "Defines and parses the exported transport-friendly contact values.",
      },
    ],
    registryDependencies: [
      {
        dependency: "button",
        purpose: "Installs the adopter-local shadcn Base UI button control.",
      },
      {
        dependency: "input",
        purpose: "Installs the adopter-local shadcn Base UI input control.",
      },
      {
        dependency: "label",
        purpose: "Installs the adopter-local shadcn Base UI label control.",
      },
      {
        dependency: "select",
        purpose: "Installs the adopter-local shadcn Base UI select control.",
      },
      {
        dependency: "textarea",
        purpose: "Installs the adopter-local shadcn Base UI textarea control.",
      },
    ],
    stylesheetAndAnimationSteps: [
      {
        title: "Keep the scoped stylesheet beside the component",
        instruction:
          "Copy the CSS Module to the same template folder; the main component already imports it relatively, so no global CSS edit is required.",
      },
      {
        title: "Keep animation packages declared",
        instruction:
          "Install GSAP, @gsap/react, and Motion exactly as listed; the source registers ScrollTrigger, scopes useGSAP cleanup, and handles reduced motion internally.",
      },
      {
        title: "Keep the font local",
        instruction:
          "Install @fontsource-variable/mulish and preserve its included OFL notice; the component import bundles it locally and the CSS Module scopes its use with fallbacks.",
      },
      {
        title: "Place the decorative asset",
        instruction:
          "Copy the SVG to public/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg, or place it under another public subpath and pass assetBaseUrl.",
      },
    ],
    importPath:
      "@components/formmuse/hanging-gifts-contact/hanging-gifts-contact-form",
    finalUsageExamplePath:
      "registry/base/hanging-gifts-contact/hanging-gifts-contact.example.tsx",
  },
  agentHandoff: {
    componentExport: "HangingGiftsContactForm",
    schemaExport: "hangingGiftsContactFormSchema",
    valuesTypeExport: "HangingGiftsContactFormValues",
    submissionProp: "onSubmit",
  },
} as const;

export const hangingGiftsContactDocumentation = createTemplateDocumentation(
  registryItem,
  hangingGiftsContactDocumentationInput,
);
