import { describe, expect, it } from "vitest";

import {
  hangingGiftsContactFormDefaultValues,
  hangingGiftsContactFormSchema,
  hangingGiftsContactRequirementValues,
} from "./hanging-gifts-contact-form.schema";

const emailAtLimit = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}.com`;

const validValues = {
  firstName: "Avery",
  lastName: "Stone",
  requirement: "corporate",
  email: "avery@example.com",
  message: "I would like to discuss a thoughtful new project.",
};

describe("hangingGiftsContactFormSchema", () => {
  it("accepts the complete transport-friendly form shape", () => {
    const parsed = hangingGiftsContactFormSchema.parse(validValues);

    expect(parsed).toEqual(validValues);
    expect(JSON.parse(JSON.stringify(parsed))).toEqual(parsed);
  });

  it("trims ordinary single-line values but preserves message formatting", () => {
    const result = hangingGiftsContactFormSchema.parse({
      ...validValues,
      firstName: "  Avery  ",
      lastName: "  Stone  ",
      requirement: "  corporate  ",
      email: "  avery@example.com  ",
      message: "  Keep this opening space.\nAnd this line.  ",
    });

    expect(result).toEqual({
      firstName: "Avery",
      lastName: "Stone",
      requirement: "corporate",
      email: "avery@example.com",
      message: "  Keep this opening space.\nAnd this line.  ",
    });
  });

  it.each(hangingGiftsContactRequirementValues)(
    "accepts rendered requirement choice %s",
    (requirement) => {
      expect(
        hangingGiftsContactFormSchema.safeParse({
          ...validValues,
          requirement,
        }).success,
      ).toBe(true);
    },
  );

  it.each(["", "new-project", "corporate-gifting"])(
    "rejects unavailable requirement value %s",
    (requirement) => {
      expect(
        hangingGiftsContactFormSchema.safeParse({
          ...validValues,
          requirement,
        }).success,
      ).toBe(false);
    },
  );

  it.each(["firstName", "requirement", "email", "message"] as const)(
    "rejects an empty required %s value",
    (field) => {
      expect(
        hangingGiftsContactFormSchema.safeParse({
          ...validValues,
          [field]: "",
        }).success,
      ).toBe(false);
    },
  );

  it("accepts an empty optional last name", () => {
    const result = hangingGiftsContactFormSchema.parse({
      ...validValues,
      lastName: "",
    });

    expect(result.lastName).toBe("");
  });

  it.each([
    ["firstName", 80],
    ["lastName", 80],
    ["message", 1200],
  ] as const)("enforces the %s limit at %i characters", (field, maximum) => {
    expect(
      hangingGiftsContactFormSchema.safeParse({
        ...validValues,
        [field]: "a".repeat(maximum),
      }).success,
    ).toBe(true);
    expect(
      hangingGiftsContactFormSchema.safeParse({
        ...validValues,
        [field]: "a".repeat(maximum + 1),
      }).success,
    ).toBe(false);
  });

  it("enforces the email limit at 254 characters", () => {
    expect(emailAtLimit).toHaveLength(254);
    expect(
      hangingGiftsContactFormSchema.safeParse({
        ...validValues,
        email: emailAtLimit,
      }).success,
    ).toBe(true);
    expect(
      hangingGiftsContactFormSchema.safeParse({
        ...validValues,
        email: `${emailAtLimit}a`,
      }).success,
    ).toBe(false);
  });

  it("validates trimmed message content without transforming it", () => {
    expect(
      hangingGiftsContactFormSchema.safeParse({
        ...validValues,
        message: "         a         ",
      }).success,
    ).toBe(false);

    const message = "   ten chars!   ";
    expect(
      hangingGiftsContactFormSchema.parse({ ...validValues, message }).message,
    ).toBe(message);
  });

  it("provides complete empty initial values", () => {
    expect(hangingGiftsContactFormDefaultValues).toEqual({
      firstName: "",
      lastName: "",
      requirement: "",
      email: "",
      message: "",
    });
  });
});
