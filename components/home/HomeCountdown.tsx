"use client";

import { useRef } from "react";
import Link from "next/link";
import { useCtfState } from "@/hooks/useCtfState";
import { useCountdown } from "@/hooks/useCountdown";
import styles from "./HomeCountdown.module.css";

function DigitReel({ value, max }: { value: number; max: number }) {
  const digits = Array.from({ length: max + 1 }, (_, i) => i);
  const prevRef = useRef(value);
  const isWrap = value > prevRef.current;
  prevRef.current = value;

  return (
    <div
      className="relative overflow-hidden digit-slot"
      style={{ height: "var(--digit-h)", width: "clamp(38px, 4.4vw, 68px)" }}
    >
      <div
        className="flex flex-col"
        style={{
          transform: `translateY(calc(-1 * ${value} * var(--digit-h)))`,
          transition: isWrap ? "none" : "transform 0.5s var(--ease-slot)",
        }}
      >
        {digits.map((d) => (
          <span
            key={d}
            className="font-heading tabular-nums flex items-center justify-center"
            style={{
              height: "var(--digit-h)",
              fontSize: "clamp(2.35rem, 5vw, 5.2rem)",
              lineHeight: 1,
            }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

function TimeUnit({
  value,
  label,
  maxTens,
}: {
  value: number;
  label: string;
  maxTens: number;
}) {
  const clamped = Math.min(value, maxTens * 10 + 9);
  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <DigitReel value={Math.floor(clamped / 10)} max={maxTens} />
        <DigitReel value={clamped % 10} max={9} />
      </div>
      <span className="font-mono text-[11px] md:text-xs tracking-[0.22em] mt-2 opacity-85 uppercase">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex items-end pb-7 md:pb-8">
      <span
        className="font-display opacity-80"
        style={{
          fontSize: "clamp(2.35rem, 5vw, 5.2rem)",
          lineHeight: 1,
        }}
      >
        :
      </span>
    </div>
  );
}

export default function HomeCountdown() {
  const ctf = useCtfState();
  const targetDate = ctf
    ? ctf.phase === "before"
      ? ctf.config.start
      : ctf.phase === "during"
        ? ctf.config.end
        : null
    : null;
  const time = useCountdown(targetDate);

  if (!ctf) return null;

  // --- After CTF ---
  if (ctf.phase === "after") {
    const durationMs = ctf.config.end.getTime() - ctf.config.start.getTime();
    const durationHours = Math.round(durationMs / 3_600_000);

    return (
      <div className={`text-center ${styles.finishedReveal}`}>
        <h2
          className="font-display text-4xl md:text-6xl font-bold mb-4"
          style={{
            color: "#EF01BA",
            textShadow:
              "0 0 12px #EF01BA, 0 0 30px #EF01BA99, 0 0 60px #EF01BA4D",
          }}
        >
          CTF FINALIZADO
        </h2>
        <p className="font-body text-white/60 mb-2">
          {ctf.config.start.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          &middot; {durationHours}h de competencia
        </p>
        <Link
          href="/scoreboard"
          className="inline-block mt-4 font-heading text-sm px-6 py-2.5 rounded-lg
                     border border-pink/40 text-pink hover:bg-pink/10 transition-colors"
        >
          Ver resultados finales
        </Link>
      </div>
    );
  }

  if (!time) return null;

  const isBefore = ctf.phase === "before";
  const label = isBefore ? "El CTF inicia en:" : "Tiempo restante:";

  const accentColor = ctf.isCritical
    ? "#ff4444"
    : ctf.isUrgent
      ? "#F77200"
      : "#EF01BA";

  const pulseClass = ctf.isCritical
    ? styles.criticalPulse
    : ctf.isUrgent
      ? styles.urgentPulse
      : "";

  return (
    <div className="text-center">
      <p className="font-heading text-base md:text-xl tracking-[0.18em] uppercase opacity-85 mb-7 md:mb-9">
        {label}
      </p>

      <div
        className={`inline-flex items-start gap-2 md:gap-4 [--digit-h:clamp(2.9rem,5.3vw,5.9rem)] ${pulseClass}`}
        style={{ color: accentColor }}
      >
        {isBefore && (
          <>
            <TimeUnit value={time.days} label="Días" maxTens={9} />
            <Separator />
          </>
        )}
        <TimeUnit value={time.hours} label="Horas" maxTens={2} />
        <Separator />
        <TimeUnit value={time.minutes} label="Min" maxTens={5} />
        <Separator />
        <TimeUnit value={time.seconds} label="Seg" maxTens={5} />
      </div>
    </div>
  );
}
