"use client";

import "@fontsource-variable/mulish";

import { useGSAP } from "@gsap/react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Camera, Check, Phone, Share2 } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  ContactRoundIcon,
  MailsIcon,
  PhoneIcon,
  type AnimatedIconHandle,
} from "./animated-icons";
import styles from "./hanging-gifts-contact-form.module.css";
import {
  hangingGiftsContactFormDefaultValues,
  hangingGiftsContactFormSchema,
  hangingGiftsContactRequirementValues,
  type HangingGiftsContactFormValues,
} from "./hanging-gifts-contact-form.schema";
import { HangingGifts } from "./hanging-gifts";
import { TemplateNavbar } from "./template-navbar";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type SubmissionState = "idle" | "submitting" | "failure" | "success";

export interface HangingGiftsContactFormProps {
  onSubmit: (values: HangingGiftsContactFormValues) => Promise<void>;
  defaultValues?: Partial<HangingGiftsContactFormValues>;
  className?: string;
  assetBaseUrl?: string;
  animationReplayKey?: number;
}

const requirementOptions = [
  {
    value: hangingGiftsContactRequirementValues[0],
    label: "Corporate & Business Gifting",
  },
  {
    value: hangingGiftsContactRequirementValues[1],
    label: "Events & Special Occasions",
  },
  {
    value: hangingGiftsContactRequirementValues[2],
    label: "Custom Requirements",
  },
] as const;

const contactMethods = [
  {
    title: "Call Us",
    detail: "+1 (555) 014-0286",
    note: "Connect",
    icon: PhoneIcon,
  },
  {
    title: "Email Us",
    detail: "hello@example.com",
    note: "Connect",
    icon: MailsIcon,
  },
  {
    title: "Book a Meeting",
    detail: "Schedule 15 mins",
    note: "Connect",
    icon: ContactRoundIcon,
  },
] as const;

function joinDescribedBy(...ids: Array<string | false | undefined>) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

export function HangingGiftsContactForm({
  onSubmit,
  defaultValues,
  className,
  assetBaseUrl = "/formmuse/hanging-gifts-contact",
  animationReplayKey,
}: HangingGiftsContactFormProps) {
  const reactId = useId();
  const instanceId = `hanging-gifts-${reactId.replaceAll(":", "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const failureHeadingRef = useRef<HTMLHeadingElement>(null);
  const submissionPendingRef = useRef(false);
  const phoneIconRef = useRef<AnimatedIconHandle>(null);
  const mailIconRef = useRef<AnimatedIconHandle>(null);
  const meetingIconRef = useRef<AnimatedIconHandle>(null);
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [initialValues] = useState<HangingGiftsContactFormValues>(() => ({
    ...hangingGiftsContactFormDefaultValues,
    ...defaultValues,
  }));
  const reduceMotion = useReducedMotion();
  const normalizedAssetBaseUrl = assetBaseUrl.replace(/\/+$/, "");

  const form = useForm<HangingGiftsContactFormValues>({
    resolver: standardSchemaResolver(hangingGiftsContactFormSchema),
    defaultValues: initialValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
  });

  const messageValue = useWatch({ control: form.control, name: "message" });
  const isSubmitting = submissionState === "submitting";

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 260, damping: 28 });
  const springY = useSpring(tiltY, { stiffness: 260, damping: 28 });
  const rotateX = useMotionTemplate`${springY}deg`;
  const rotateY = useMotionTemplate`${springX}deg`;

  // GSAP is justified here by the coordinated, replayable hero sequence.
  // A changed replay key reverts and recreates only this scoped intro context;
  // React-owned form state, focus, and element identity remain untouched.
  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)" },
        (context) => {
          if (context.conditions?.reduceMotion) {
            gsap.set(
              ".hgc-hero-overline, .hgc-hero-title, .hgc-hero-description, .hgc-form-section",
              { clearProps: "all" },
            );
            return;
          }

          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .fromTo(
              ".hgc-hero-overline",
              { y: 20, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.7 },
              0.3,
            )
            .fromTo(
              ".hgc-hero-title",
              { yPercent: 100, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: 1,
                ease: "power2.out",
              },
              "-=0.4",
            )
            .fromTo(
              ".hgc-hero-description",
              { y: 20, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.7 },
              "-=0.5",
            )
            .fromTo(
              ".hgc-form-section",
              { y: 60, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 1.2, ease: "power2.out" },
              0.3,
            );
        },
        rootRef,
      );

      return () => media.revert();
    },
    {
      dependencies: [animationReplayKey],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  // Supporting-section reveals stay one-shot and are deliberately outside
  // the replayable intro context.
  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)" },
        (context) => {
          if (context.conditions?.reduceMotion) {
            gsap.set(".hgc-connect-heading, .hgc-contact-card", {
              clearProps: "all",
            });
            return;
          }

          gsap.from(".hgc-connect-heading", {
            y: 28,
            autoAlpha: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".hgc-connect-heading",
              start: "clamp(top 84%)",
              once: true,
            },
          });

          gsap.from(".hgc-contact-card", {
            y: 44,
            autoAlpha: 0,
            duration: 0.7,
            stagger: 0.16,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: ".hgc-contact-cards",
              start: "clamp(top 82%)",
              once: true,
            },
          });
        },
        rootRef,
      );

      return () => media.revert();
    },
    { scope: rootRef },
  );

  useEffect(() => {
    if (submissionState === "failure") {
      failureHeadingRef.current?.focus();
    }

    if (submissionState === "success") {
      successHeadingRef.current?.focus();
    }
  }, [submissionState]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const xPercentage = (event.clientX - rect.left) / rect.width - 0.5;
    const yPercentage = (event.clientY - rect.top) / rect.height - 0.5;

    tiltX.set(xPercentage * 8);
    tiltY.set(yPercentage * -8);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const handleValidSubmit = async (values: HangingGiftsContactFormValues) => {
    if (submissionPendingRef.current) return;

    submissionPendingRef.current = true;
    setSubmissionState("submitting");

    try {
      await onSubmit(values);
      setSubmissionState("success");
    } catch {
      submissionPendingRef.current = false;
      setSubmissionState("failure");
    }
  };

  const handleSendAnother = () => {
    submissionPendingRef.current = false;
    form.reset(initialValues);
    setSubmissionState("idle");
    requestAnimationFrame(() => form.setFocus("firstName"));
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(handleValidSubmit)(event);
  };

  const fieldIds = {
    firstName: `${instanceId}-first-name`,
    lastName: `${instanceId}-last-name`,
    requirement: `${instanceId}-requirement`,
    email: `${instanceId}-email`,
    message: `${instanceId}-message`,
  };
  const formDescriptionId = `${instanceId}-form-description`;
  const messageCounterId = `${instanceId}-message-counter`;
  const contactSectionId = `${instanceId}-contact`;

  return (
    <div
      ref={rootRef}
      className={cn(
        styles.root,
        "relative min-h-screen w-full overflow-x-clip bg-[var(--hgc-paper)] text-[var(--hgc-ink)]",
        className,
      )}
      data-formmuse-template="hanging-gifts-contact"
    >
      <TemplateNavbar />

      <main>
        <div className="fixed inset-0 z-0 h-screen">
          {/* Distributed templates must use a framework-neutral image element. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${normalizedAssetBaseUrl}/hanging-gifts-hero.svg`}
            alt=""
            width={1536}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        </div>

        <div className="pointer-events-none sticky top-0 z-10 flex h-[100svh] min-h-[38rem] w-full items-center justify-center px-4 text-center">
          <div className="flex flex-col items-center text-white">
            <p className="hgc-hero-overline mb-6 text-xs font-bold tracking-[0.3em] text-[var(--hgc-ember-bright)] uppercase drop-shadow-lg md:text-sm">
              Get in touch
            </p>
            <div className="mb-8 overflow-hidden pb-2">
              <h1
                className={`${styles.heroTitle} hgc-hero-title leading-[0.9] font-extrabold tracking-tight drop-shadow-2xl`}
              >
                Let&apos;s Talk Gifting.
              </h1>
            </div>
            <p
              className={`${styles.heroDescription} hgc-hero-description max-w-2xl leading-relaxed font-light text-white/90 drop-shadow-md`}
            >
              We&apos;ll guide you through the next steps with clarity and
              thoughtful recommendations.
            </p>
          </div>
        </div>

        <div
          id={contactSectionId}
          className={`${styles.formSection} hgc-form-section relative z-20 -mt-32 bg-[var(--hgc-paper)] shadow-[0_-20px_50px_rgba(0,0,0,0.2)]`}
        >
          <HangingGifts />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 lg:px-12 lg:py-32">
            <div className={styles.contentGrid}>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: -36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: reduceMotion ? 0 : 0.75,
                  ease: "easeOut",
                }}
              >
                <p className="mb-4 text-sm font-bold tracking-[0.2em] text-[var(--hgc-ember-text)] uppercase">
                  Inquire
                </p>
                <h2 className="mb-8 max-w-2xl text-4xl leading-tight font-extrabold tracking-tight text-[var(--hgc-forest)] md:text-6xl">
                  Tell Us What You&apos;re Looking For
                </h2>
                <p className="mb-12 max-w-xl text-xl leading-relaxed font-light text-gray-600 md:text-2xl">
                  Let us know what you&apos;re planning and what matters most to
                  you. We&apos;ll take it from there and guide you through the
                  next steps with clarity.
                </p>

                <div className="flex items-center gap-6">
                  <span className="text-lg font-bold text-[var(--hgc-forest)]">
                    Socials:
                  </span>
                  {/* Generic placeholders intentionally avoid third-party brand marks. */}
                  {[Share2, Camera, Phone].map((Icon, index) => (
                    <span
                      key={index}
                      aria-label={
                        [
                          "Social sharing placeholder",
                          "Photo sharing placeholder",
                          "Phone placeholder",
                        ][index]
                      }
                      role="img"
                      className="flex size-14 items-center justify-center rounded-full border border-gray-200 bg-white text-[var(--hgc-forest)] shadow-sm transition-all duration-300 hover:scale-110 hover:border-[var(--hgc-ember)] hover:bg-[var(--hgc-ember)] hover:text-white motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      <Icon className="size-6" />
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative w-full overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/80 p-8 shadow-xl backdrop-blur-md will-change-transform md:p-12"
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
                onPointerMove={handlePointerMove}
                onPointerLeave={resetTilt}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/40 to-transparent" />

                <div
                  className="relative z-10"
                  style={{ transform: "translateZ(30px)" }}
                >
                  {submissionState === "success" ? (
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.35 }}
                      className="flex min-h-[34rem] flex-col items-center justify-center py-12 text-center"
                    >
                      <span className="mb-7 flex size-24 items-center justify-center rounded-full bg-[var(--hgc-forest)] text-white shadow-2xl">
                        <Check
                          aria-hidden="true"
                          className="size-11"
                          strokeWidth={3}
                        />
                      </span>
                      <h3
                        ref={successHeadingRef}
                        tabIndex={-1}
                        className="text-4xl font-black tracking-[-0.04em] text-[var(--hgc-forest)] outline-none"
                      >
                        Message sent
                      </h3>
                      <p className="mt-4 max-w-md text-lg leading-8 text-[var(--hgc-muted)]">
                        Thank you for reaching out. Your message is on its way
                        to the people who can help.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-8 min-h-11 rounded-full border-[var(--hgc-forest)] px-6 text-[var(--hgc-forest)] hover:bg-[var(--hgc-forest)] hover:text-white"
                        onClick={handleSendAnother}
                      >
                        Send another
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <form
                        ref={formRef}
                        noValidate
                        className={styles.form}
                        aria-busy={isSubmitting}
                        aria-describedby={formDescriptionId}
                        onSubmit={handleFormSubmit}
                      >
                        <p
                          id={formDescriptionId}
                          className={styles.requirementNote}
                        >
                          All fields are required unless marked optional.
                        </p>

                        {submissionState === "failure" ? (
                          <div className="mb-6 rounded-2xl border border-[color:color-mix(in_srgb,var(--hgc-error)_32%,transparent)] bg-[color:color-mix(in_srgb,var(--hgc-error)_7%,white)] p-5">
                            <h3
                              ref={failureHeadingRef}
                              tabIndex={-1}
                              className="font-black text-[var(--hgc-error)] outline-none"
                            >
                              We could not send your message
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-[var(--hgc-ink)]">
                              Your answers are still here. Check your connection
                              and try again when you are ready.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-4 min-h-11 rounded-full border-[var(--hgc-error)] px-5 text-[var(--hgc-error)] hover:bg-[var(--hgc-error)] hover:text-white"
                              onClick={() => formRef.current?.requestSubmit()}
                            >
                              Try again
                            </Button>
                          </div>
                        ) : null}

                        <fieldset
                          disabled={isSubmitting}
                          className="space-y-6 disabled:opacity-75"
                        >
                          <div className={styles.nameGrid}>
                            <div>
                              <div className={styles.fieldShell}>
                                <Label
                                  htmlFor={fieldIds.firstName}
                                  className={styles.fieldLabel}
                                >
                                  First name
                                </Label>
                                <Input
                                  id={fieldIds.firstName}
                                  type="text"
                                  placeholder="First Name"
                                  autoComplete="given-name"
                                  maxLength={80}
                                  required
                                  aria-invalid={Boolean(
                                    form.formState.errors.firstName,
                                  )}
                                  aria-describedby={joinDescribedBy(
                                    form.formState.errors.firstName &&
                                      `${fieldIds.firstName}-error`,
                                  )}
                                  className="h-auto min-h-14 rounded-2xl border-gray-200 bg-white/80 px-6 py-4 text-lg text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus-visible:border-[var(--hgc-ember)] focus-visible:bg-white focus-visible:ring-[var(--hgc-ember)]/25"
                                  {...form.register("firstName")}
                                />
                              </div>
                              {form.formState.errors.firstName ? (
                                <p
                                  id={`${fieldIds.firstName}-error`}
                                  className="mt-2 text-sm text-[var(--hgc-error)]"
                                >
                                  {form.formState.errors.firstName.message}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <div className={styles.fieldShell}>
                                <Label
                                  htmlFor={fieldIds.lastName}
                                  className={styles.fieldLabel}
                                >
                                  Last name{" "}
                                  <span className={styles.optionalTag}>
                                    (optional)
                                  </span>
                                </Label>
                                <Input
                                  id={fieldIds.lastName}
                                  type="text"
                                  placeholder="Last Name"
                                  autoComplete="family-name"
                                  maxLength={80}
                                  aria-invalid={Boolean(
                                    form.formState.errors.lastName,
                                  )}
                                  aria-describedby={joinDescribedBy(
                                    form.formState.errors.lastName &&
                                      `${fieldIds.lastName}-error`,
                                  )}
                                  className="h-auto min-h-14 rounded-2xl border-gray-200 bg-white/80 px-6 py-4 text-lg text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus-visible:border-[var(--hgc-ember)] focus-visible:bg-white focus-visible:ring-[var(--hgc-ember)]/25"
                                  {...form.register("lastName")}
                                />
                              </div>
                              {form.formState.errors.lastName ? (
                                <p
                                  id={`${fieldIds.lastName}-error`}
                                  className="mt-2 text-sm text-[var(--hgc-error)]"
                                >
                                  {form.formState.errors.lastName.message}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <Controller
                            name="requirement"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <div>
                                <div className={styles.fieldShell}>
                                  <Label
                                    id={`${fieldIds.requirement}-label`}
                                    htmlFor={fieldIds.requirement}
                                    className={styles.fieldLabel}
                                  >
                                    Requirement
                                  </Label>
                                  <Select
                                    name={field.name}
                                    value={field.value || null}
                                    onValueChange={(value) =>
                                      field.onChange(value ?? "")
                                    }
                                  >
                                    <SelectTrigger
                                      ref={field.ref}
                                      id={fieldIds.requirement}
                                      aria-labelledby={`${fieldIds.requirement}-label`}
                                      aria-required="true"
                                      aria-invalid={Boolean(fieldState.error)}
                                      aria-describedby={joinDescribedBy(
                                        fieldState.error &&
                                          `${fieldIds.requirement}-error`,
                                      )}
                                      className="h-auto min-h-14 w-full rounded-2xl border-gray-200 bg-white/80 px-6 py-4 text-lg text-gray-800 shadow-sm transition-all focus-visible:border-[var(--hgc-ember)] focus-visible:bg-white focus-visible:ring-[var(--hgc-ember)]/25"
                                      onBlur={field.onBlur}
                                    >
                                      <SelectValue placeholder="Select your requirement" />
                                    </SelectTrigger>
                                    <SelectContent className="[--accent-foreground:var(--hgc-forest)] [--accent:var(--hgc-paper)] [--background:#fff] [--foreground:var(--hgc-ink)] [--popover-foreground:var(--hgc-ink)] [--popover:#fff]">
                                      {requirementOptions.map((option) => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                          className="min-h-11"
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {fieldState.error ? (
                                  <p
                                    id={`${fieldIds.requirement}-error`}
                                    className="mt-2 text-sm text-[var(--hgc-error)]"
                                  >
                                    {fieldState.error.message}
                                  </p>
                                ) : null}
                              </div>
                            )}
                          />

                          <div>
                            <div className={styles.fieldShell}>
                              <Label
                                htmlFor={fieldIds.email}
                                className={styles.fieldLabel}
                              >
                                Email address
                              </Label>
                              <Input
                                id={fieldIds.email}
                                type="email"
                                placeholder="Email Address"
                                inputMode="email"
                                autoComplete="email"
                                maxLength={254}
                                required
                                aria-invalid={Boolean(
                                  form.formState.errors.email,
                                )}
                                aria-describedby={joinDescribedBy(
                                  form.formState.errors.email &&
                                    `${fieldIds.email}-error`,
                                )}
                                className="h-auto min-h-14 rounded-2xl border-gray-200 bg-white/80 px-6 py-4 text-lg text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus-visible:border-[var(--hgc-ember)] focus-visible:bg-white focus-visible:ring-[var(--hgc-ember)]/25"
                                {...form.register("email")}
                              />
                            </div>
                            {form.formState.errors.email ? (
                              <p
                                id={`${fieldIds.email}-error`}
                                className="mt-2 text-sm text-[var(--hgc-error)]"
                              >
                                {form.formState.errors.email.message}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <div className={styles.fieldShell}>
                              <Label
                                htmlFor={fieldIds.message}
                                className={styles.fieldLabel}
                              >
                                Message
                              </Label>
                              <span id={messageCounterId} className="sr-only">
                                {messageValue.length} of 1,200 characters used
                              </span>
                              <Textarea
                                id={fieldIds.message}
                                rows={4}
                                placeholder="Tell us what you're looking for (product type, quantity, budget, timeline)"
                                maxLength={1200}
                                required
                                aria-invalid={Boolean(
                                  form.formState.errors.message,
                                )}
                                aria-describedby={joinDescribedBy(
                                  messageCounterId,
                                  form.formState.errors.message &&
                                    `${fieldIds.message}-error`,
                                )}
                                className="min-h-32 resize-none rounded-2xl border-gray-200 bg-white/80 px-6 py-4 text-lg text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus-visible:border-[var(--hgc-ember)] focus-visible:bg-white focus-visible:ring-[var(--hgc-ember)]/25"
                                {...form.register("message")}
                              />
                            </div>
                            {form.formState.errors.message ? (
                              <p
                                id={`${fieldIds.message}-error`}
                                className="mt-2 text-sm text-[var(--hgc-error)]"
                              >
                                {form.formState.errors.message.message}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex pt-2">
                            <Button
                              type="submit"
                              className="group relative min-h-14 w-full overflow-hidden rounded-full bg-[var(--hgc-forest)] px-10 text-lg font-bold tracking-wide text-white shadow-xl transition-transform duration-300 hover:scale-[1.02] hover:bg-[var(--hgc-forest)] focus-visible:ring-[var(--hgc-ember)]/40 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
                            >
                              <span className="absolute inset-0 translate-y-full bg-[var(--hgc-ember)] transition-transform duration-500 ease-out group-hover:translate-y-0 motion-reduce:transition-none" />
                              <span className="relative z-10">
                                {isSubmitting ? "Sending…" : "Submit"}
                              </span>
                            </Button>
                          </div>
                        </fieldset>
                      </form>
                      <div className="mt-3 min-h-6 text-center">
                        {isSubmitting ? (
                          <p
                            role="status"
                            className="text-sm font-semibold text-[var(--hgc-forest)]"
                          >
                            Sending your message…
                          </p>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <section className="mx-auto mt-8 mb-16 w-full max-w-7xl px-4 py-16 lg:px-12">
            <div className="hgc-connect-heading mb-20 text-center">
              <p className="mb-6 text-base font-bold tracking-[0.3em] text-[var(--hgc-ember-text)] uppercase md:text-lg">
                Reach Out
              </p>
              <h2 className="text-5xl leading-[1.1] font-extrabold tracking-tight text-[var(--hgc-forest)] md:text-6xl lg:text-7xl">
                Other ways to connect.
              </h2>
            </div>

            <div className={`${styles.contactCards} hgc-contact-cards`}>
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                const iconRef = [phoneIconRef, mailIconRef, meetingIconRef][
                  index
                ];
                return (
                  <article
                    key={method.title}
                    className="hgc-contact-card group flex flex-col items-center rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-lg transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-2 hover:border-[var(--hgc-ember)] motion-reduce:transform-none motion-reduce:transition-none"
                    onMouseEnter={() => iconRef.current?.startAnimation()}
                    onMouseLeave={() => iconRef.current?.stopAnimation()}
                  >
                    <span className="mb-6 flex size-16 items-center justify-center rounded-full bg-[var(--hgc-paper)] text-[var(--hgc-forest)] transition-colors duration-300 group-hover:bg-[var(--hgc-ember)] group-hover:text-white motion-reduce:transition-none">
                      <Icon ref={iconRef} size={32} />
                    </span>
                    <h3 className="mb-3 text-2xl font-extrabold text-[var(--hgc-forest)]">
                      {method.title}
                    </h3>
                    <p className="mb-6 text-lg font-light text-gray-500">
                      {method.detail}
                    </p>
                    <p className="flex items-center gap-2 font-bold text-[var(--hgc-ember-text)] transition-all duration-300 group-hover:gap-4 motion-reduce:transition-none">
                      {method.note}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
