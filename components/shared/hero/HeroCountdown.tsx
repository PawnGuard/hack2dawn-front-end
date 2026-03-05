// components/shared/hero/HeroCountdown.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculate(target: Date): TimeLeft {
  const diff = Math.max(target.getTime() - Date.now(), 0);
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  };
}

const DIGIT_HEIGHT = 80; // px — must match --digit-height in globals.css

/**
 * Vertical digit reel showing digits 0..max stacked, scrolling to `value`.
 * Uses cubic-bezier(1,0,1,0) — the slot-machine snap easing from the original.
 * On wraparound (countdown: value jumps up) the transition is disabled so it
 * snaps instantly rather than rolling backwards.
 */
function DigitReel({ value, max }: { value: number; max: number }) {
  const digits = Array.from({ length: max + 1 }, (_, i) => i);
  const prevRef = useRef(value);
  // In countdown, value should only decrease; an increase means a wraparound.
  const isWrap = value > prevRef.current;
  prevRef.current = value;

  return (
    <div
      className="relative overflow-hidden digit-slot"
      style={{ height: DIGIT_HEIGHT, width: 52 }}
    >
      <div
        className="flex flex-col"
        style={{
          transform: `translateY(-${value * DIGIT_HEIGHT}px)`,
          transition: isWrap ? "none" : `transform 0.5s var(--ease-slot)`,
        }}
      >
        {digits.map((d) => (
          <span
            key={d}
            className="font-heading text-sw-cyan tabular-nums
                       flex items-center justify-center"
            style={{ height: DIGIT_HEIGHT, fontSize: "3.75rem", lineHeight: 1 }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * One time unit rendered as two digit reels (tens + ones).
 * maxTens controls how many digits the tens reel has (e.g. 5 for mins/secs,
 * 2 for hours, 9 for days).
 */
function TimeUnit({
  value,
  label,
  maxTens,
}: {
  value: number;
  label: string;
  maxTens: number;
}) {
  // Clamp so the reel never goes out of bounds
  const clamped = Math.min(value, maxTens * 10 + 9);
  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <DigitReel value={Math.floor(clamped / 10)} max={maxTens} />
        <DigitReel value={clamped % 10}             max={9} />
      </div>
      <span className="font-cyber text-xs text-sw-muted tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex items-end pb-7">
      <span
        className="font-display text-sw-cyan opacity-40"
        style={{ fontSize: "3.75rem", lineHeight: 1 }}
      >
        :
      </span>
    </div>
  );
}

export default function HeroCountdown({ targetDate }: { targetDate: Date }) {
  // null on SSR → real value only after mount, prevents hydration mismatch
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calculate(targetDate));
    const id = setInterval(() => setTime(calculate(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!time) return null;

  return (
    <div className="flex items-start gap-1 md:gap-3">
      <TimeUnit value={time.days}    label="DAYS"  maxTens={9} />
      <Separator />
      <TimeUnit value={time.hours}   label="HOURS" maxTens={2} />
      <Separator />
      <TimeUnit value={time.minutes} label="MINS"  maxTens={5} />
      <Separator />
      <TimeUnit value={time.seconds} label="SECS"  maxTens={5} />
    </div>
  );
}