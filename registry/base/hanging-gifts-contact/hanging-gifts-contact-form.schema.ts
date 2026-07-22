import { z } from "zod/v4";

export const hangingGiftsContactRequirementValues = [
  "corporate",
  "events",
  "custom",
] as const;

export const hangingGiftsContactFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter your first name.")
    .max(80, "Use 80 characters or fewer."),
  lastName: z.string().trim().max(80, "Use 80 characters or fewer."),
  requirement: z
    .string()
    .trim()
    .refine(
      (value) =>
        hangingGiftsContactRequirementValues.includes(
          value as (typeof hangingGiftsContactRequirementValues)[number],
        ),
      "Choose what you would like to discuss.",
    ),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "Use 254 characters or fewer.")
    .email("Enter an email address like name@example.com."),
  message: z
    .string()
    .refine((value) => value.trim().length > 0, "Enter a message.")
    .refine(
      (value) => value.trim().length >= 10,
      "Enter at least 10 characters.",
    )
    .max(1200, "Use 1,200 characters or fewer."),
});

export type HangingGiftsContactFormValues = z.output<
  typeof hangingGiftsContactFormSchema
>;

export const hangingGiftsContactFormDefaultValues: HangingGiftsContactFormValues =
  {
    firstName: "",
    lastName: "",
    requirement: "",
    email: "",
    message: "",
  };
