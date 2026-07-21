"use client";

import type { Variants } from "motion/react";
import {
  LazyMotion,
  domAnimation,
  m,
  useAnimation,
  useReducedMotion,
} from "motion/react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedIconProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  | "color"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
> {
  size?: number;
  duration?: number;
  color?: string;
}

function useIconControls(ref: React.ForwardedRef<AnimatedIconHandle>) {
  const controls = useAnimation();
  const reduceMotion = useReducedMotion();
  const controlled = useRef(false);

  useImperativeHandle(ref, () => {
    controlled.current = true;
    return {
      startAnimation: () =>
        reduceMotion ? controls.start("normal") : controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    };
  });

  const start = useCallback(() => {
    if (!controlled.current && !reduceMotion) void controls.start("animate");
  }, [controls, reduceMotion]);
  const stop = useCallback(() => {
    if (!controlled.current) void controls.start("normal");
  }, [controls]);

  return { controls, start, stop };
}

export const PhoneIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 24, duration = 1, color, ...props }, ref) => {
    const { controls, start, stop } = useIconControls(ref);
    const phoneVariants: Variants = {
      normal: { rotate: 0 },
      animate: {
        rotate: [0, -8, 8, -6, 6, 0],
        transition: { duration: 0.9 * duration, ease: "easeInOut" },
      },
    };
    const pulseVariants: Variants = {
      normal: { opacity: 0, scale: 0.3 },
      animate: {
        opacity: [0, 0.25, 0],
        scale: [0.3, 1.5],
        transition: { duration: 0.9 * duration, ease: "easeOut" },
      },
    };

    return (
      <LazyMotion features={domAnimation} strict>
        <m.div
          className={cn("inline-flex items-center justify-center", className)}
          onMouseEnter={start}
          onMouseLeave={stop}
          style={{ color, ...props.style }}
          {...props}
        >
          <m.svg
            aria-hidden="true"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <m.circle
              cx="12"
              cy="12"
              r="10"
              variants={pulseVariants}
              initial="normal"
              animate={controls}
            />
            <m.path
              d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
              variants={phoneVariants}
              initial="normal"
              animate={controls}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          </m.svg>
        </m.div>
      </LazyMotion>
    );
  },
);
PhoneIcon.displayName = "PhoneIcon";

export const MailsIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 24, duration = 1, color, ...props }, ref) => {
    const { controls, start, stop } = useIconControls(ref);
    const outline: Variants = {
      normal: { opacity: 1 },
      animate: {
        opacity: [0.7, 1, 0.5, 1],
        transition: { duration: 1.4 * duration, ease: "easeInOut" },
      },
    };

    return (
      <LazyMotion features={domAnimation} strict>
        <m.div
          className={cn("inline-flex items-center justify-center", className)}
          onMouseEnter={start}
          onMouseLeave={stop}
          style={{ color, ...props.style }}
          {...props}
        >
          <m.svg
            aria-hidden="true"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial="normal"
            animate={controls}
            variants={{
              normal: { y: 0, scale: 1 },
              animate: {
                y: [0, -3, 3, -2, 0],
                scale: [1, 1.05, 0.95, 1],
                transition: { duration: 1.6 * duration, ease: "easeInOut" },
              },
            }}
          >
            <m.path
              d="M17 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 1-1.732"
              variants={outline}
            />
            <m.path
              d="m22 5.5-6.419 4.179a2 2 0 0 1-2.162 0L7 5.5"
              variants={{
                normal: { rotate: 0, opacity: 1 },
                animate: {
                  rotate: [-4, 4, -3, 0],
                  opacity: [1, 0.7, 1],
                  transition: { duration: 1.2 * duration, ease: "easeInOut" },
                },
              }}
            />
            <m.rect
              x="7"
              y="3"
              width="15"
              height="12"
              rx="2"
              variants={outline}
            />
          </m.svg>
        </m.div>
      </LazyMotion>
    );
  },
);
MailsIcon.displayName = "MailsIcon";

export const ContactRoundIcon = forwardRef<
  AnimatedIconHandle,
  AnimatedIconProps
>(({ className, size = 24, duration = 1, color, ...props }, ref) => {
  const { controls, start, stop } = useIconControls(ref);
  const line: Variants = {
    normal: { x: 0, opacity: 1 },
    animate: {
      x: [-10, 0],
      opacity: [0, 1],
      transition: { duration: 0.4 * duration, delay: 0.6 },
    },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={cn("inline-flex items-center justify-center", className)}
        onMouseEnter={start}
        onMouseLeave={stop}
        style={{ color, ...props.style }}
        {...props}
      >
        <m.svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <m.path
            d="M16 2v2"
            variants={line}
            initial="normal"
            animate={controls}
          />
          <m.path
            d="M17.915 22a6 6 0 0 0-12 0"
            strokeDasharray="30"
            variants={{
              normal: { opacity: 1, strokeDashoffset: 0 },
              animate: {
                strokeDashoffset: [30, 0],
                opacity: [0, 1],
                transition: { duration: 0.6 * duration, delay: 0.5 },
              },
            }}
            initial="normal"
            animate={controls}
          />
          <m.path
            d="M8 2v2"
            variants={line}
            initial="normal"
            animate={controls}
          />
          <m.circle
            cx="12"
            cy="12"
            r="4"
            variants={{
              normal: { scale: 1, opacity: 1 },
              animate: {
                scale: [0.5, 1.2, 1],
                opacity: [0, 1],
                transition: { duration: 0.6 * duration, delay: 0.3 },
              },
            }}
            initial="normal"
            animate={controls}
          />
          <m.rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            strokeDasharray="100"
            variants={{
              normal: { strokeDashoffset: 0, opacity: 1 },
              animate: {
                strokeDashoffset: [100, 0],
                opacity: [0.3, 1],
                transition: { duration: 0.8 * duration },
              },
            }}
            initial="normal"
            animate={controls}
          />
        </m.svg>
      </m.div>
    </LazyMotion>
  );
});
ContactRoundIcon.displayName = "ContactRoundIcon";
