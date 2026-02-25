// components/shared/hero/HeroCountdown.tsx
"use client";

import { useEffect, useState } from "react";

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

export default function HeroCountdown({ targetDate }: { targetDate: Date }) {
  const [time, setTime] = useState<TimeLeft>(calculate(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(calculate(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "DAYS",    value: time.days },
    { label: "HOURS",   value: time.hours },
    { label: "MINS",    value: time.minutes },
    { label: "SECS",    value: time.seconds },
  ];

  return (
    <div className="flex gap-4 md:gap-8">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="font-retro text-4xl md:text-6xl text-sw-cyan
                           shadow-neon-cyan tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="font-cyber text-xs text-sw-muted tracking-widest mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}