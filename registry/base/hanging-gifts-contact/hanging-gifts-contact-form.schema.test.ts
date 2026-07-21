import { describe, expect, it } from "vitest";

import {
  hangingGiftsContactFormDefaultValues,
  hangingGiftsContactFormSchema,
} from "./hanging-gifts-contact-form.schema";

const validValues = {
  firstName: "Avery",
  lastName: "Stone",
  requirement: "new-project",
  email: "avery@example.com",
  message: "I would like to discuss a thoughtful new project.",
};

describe("hangingGiftsContactFormSchema", () => {
  it("accepts the complete transport-friendly form shape", () => {
    expect(hangingGiftsContactFormSchema.parse(validValues)).toEqual(
      validValues,
    );
  });

  it("trims ordinary single-line values but preserves message formatting", () => {
    const result = hangingGiftsContactFormSchema.parse({
      ...validValues,
      firstName: "  Avery  ",
      email: "  avery@example.com  ",
      message: "  Keep this opening space.\nAnd this line.  ",
    });

    expect(result.firstName).toBe("Avery");
    expect(result.email).toBe("avery@example.com");
    expect(result.message).toBe("  Keep this opening space.\nAnd this line.  ");
  });

  it("accepts an empty optional last name", () => {
    const result = hangingGiftsContactFormSchema.parse({
      ...validValues,
      lastName: "",
    });

    expect(result.lastName).toBe("");
  });

  it("keeps native and schema length boundaries aligned", () => {
    expect(
      hangingGiftsContactFormSchema.safeParse({
        ...validValues,
        firstName: "a".repeat(80),
        message: "a".repeat(1200),
      }).success,
    ).toBe(true);

    expect(
      hangingGiftsContactFormSchema.safeParse({
        ...validValues,
        firstName: "a".repeat(81),
      }).success,
    ).toBe(false);

    expect(
      hangingGiftsContactFormSchema.safeParse({
        ...validValues,
        message: "a".repeat(1201),
      }).success,
    ).toBe(false);
  });

  it("provides complete empty initial values", () => {
    expect(Object.keys(hangingGiftsContactFormDefaultValues)).toEqual([
      "firstName",
      "lastName",
      "requirement",
      "email",
      "message",
    ]);
  });
});
