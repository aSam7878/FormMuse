"use client";

import { motion, useReducedMotion } from "motion/react";

import styles from "./hanging-gifts-contact-form.module.css";

const sparkleDelays = [
  [0, 3.6, 7.1, 11.4],
  [1.8, 5.2, 9.8, 14.1],
  [4.3, 8.7, 12.5, 2.1],
  [2.6, 6.9, 10.3, 15.7],
  [5.1, 9.4, 13.8, 1.2],
  [3.4, 7.8, 11.9, 16.3],
] as const;

const sparkleDurations = [
  [7, 8.5, 9.2, 10],
  [8, 7.5, 10.5, 9],
  [9, 8, 7.5, 11],
  [7.5, 9.5, 8.5, 10.5],
  [8.5, 10, 9, 7.5],
  [10, 7.5, 8, 9.5],
] as const;

const gifts = [
  { left: "10%", length: 70, delay: 0, duration: 1.8, inverted: false },
  { left: "25%", length: 130, delay: 0.4, duration: 2.4, inverted: true },
  { left: "42%", length: 50, delay: 0.2, duration: 1.6, inverted: false },
  { left: "60%", length: 110, delay: 0.7, duration: 2.2, inverted: true },
  { left: "75%", length: 85, delay: 0.3, duration: 1.9, inverted: false },
  { left: "90%", length: 140, delay: 0.6, duration: 2.6, inverted: true },
] as const;

const sparkleClasses = [
  styles.sparkleA,
  styles.sparkleB,
  styles.sparkleC,
  styles.sparkleD,
] as const;

function GiftBox({ inverted }: { inverted: boolean }) {
  const boxColor = inverted ? "#E57E31" : "#16423C";
  const ribbonColor = inverted ? "#16423C" : "#E57E31";

  return (
    <svg
      aria-hidden="true"
      className="size-10 drop-shadow-md"
      viewBox="0 0 64 64"
      fill="none"
    >
      <rect x="8" y="24" width="48" height="32" rx="4" fill={boxColor} />
      <rect x="4" y="16" width="56" height="12" rx="2" fill={boxColor} />
      <rect x="26" y="16" width="12" height="40" fill={ribbonColor} />
      <rect x="4" y="20" width="56" height="4" fill={ribbonColor} />
      <path d="M32 16S26 2 20 8s6 8 12 8Z" fill={ribbonColor} />
      <path d="M32 16S38 2 44 8s-6 8-12 8Z" fill={ribbonColor} />
    </svg>
  );
}

function Sparkles({ giftIndex }: { giftIndex: number }) {
  const delays = sparkleDelays[giftIndex] ?? sparkleDelays[0];
  const durations = sparkleDurations[giftIndex] ?? sparkleDurations[0];

  return (
    <span className="pointer-events-none absolute top-10 left-1/2 h-32 w-8 -translate-x-1/2">
      {sparkleClasses.map((className, index) => (
        <svg
          key={className}
          aria-hidden="true"
          className={`absolute top-0 left-0 ${className}`}
          width={11 - index}
          height={11 - index}
          viewBox="0 0 24 24"
          fill="var(--hgc-ember-bright)"
          style={{
            animationDelay: `${delays[index]}s`,
            animationDuration: `${durations[index]}s`,
          }}
        >
          <path d="m12 0 2.59 9.41L24 12l-9.41 2.59L12 24l-2.59-9.41L0 12l9.41-2.59L12 0Z" />
        </svg>
      ))}
    </span>
  );
}

export function HangingGifts() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`${styles.giftCurtain} pointer-events-none absolute top-0 left-0 z-30 h-48 w-full overflow-visible`}
    >
      {gifts.map((gift, index) => (
        <motion.div
          key={`${gift.left}-${gift.length}`}
          data-formmuse-gift
          className="absolute top-0 z-10 flex origin-top flex-col items-center will-change-transform"
          style={{ left: gift.left }}
          initial={{ rotate: reduceMotion ? 0 : -5 }}
          animate={{ rotate: reduceMotion ? 0 : 5 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: gift.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: gift.delay,
                }
          }
        >
          <span
            className="w-px bg-gradient-to-b from-stone-300 to-stone-500"
            style={{ height: `${gift.length}px` }}
          />
          <span className="relative -mt-2">
            <GiftBox inverted={gift.inverted} />
            <Sparkles giftIndex={index} />
          </span>
        </motion.div>
      ))}
    </div>
  );
}
