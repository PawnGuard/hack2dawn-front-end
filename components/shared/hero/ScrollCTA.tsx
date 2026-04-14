// components/shared/hero/ScrollCTA.tsx
"use client";

import { useCallback } from "react";

export default function ScrollCTA() {
  const handleScroll = useCallback(() => {
    const target = document.getElementById("schedule");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <button
      onClick={handleScroll}
      aria-label="Ver itinerario — desplazar hacia abajo"
      className="group relative flex flex-col items-center gap-1 mt-10
                 cursor-pointer select-none bg-transparent border-none
                 focus:outline-none focus-visible:ring-2
                 focus-visible:ring-sw-cyan focus-visible:ring-offset-4
                 focus-visible:ring-offset-sw-void"
    >
      {/* ── Label ───────────────────────────────────────── */}
      <span
        className="font-heading tracking-[0.3em] uppercase text-xs
                   text-sw-cyan/70 group-hover:text-sw-cyan
                   transition-colors duration-300
                   [text-shadow:0_0_10px_rgba(0,240,255,0.4)]"
      >
        [ VER ITINERARIO ]
      </span>

      {/* ── Scanline rule ────────────────────────────────── */}
      <span
        className="w-px h-4 bg-gradient-to-b from-sw-cyan/40 to-transparent"
        aria-hidden="true"
      />

      {/* ── Double-arrow wrapper ─────────────────────────── */}
      <span className="relative flex flex-col items-center" aria-hidden="true">

        {/* Arrow 1 — leads the animation */}
        <svg
          viewBox="0 0 24 12"
          width="28"
          height="14"
          fill="none"
          className="animate-[swArrow_1.6s_ease-in-out_infinite]
                     drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]"
        >
          <polyline
            points="2,2 12,10 22,2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-sw-cyan"
          />
        </svg>

        {/* Arrow 2 — trails with delay */}
        <svg
          viewBox="0 0 24 12"
          width="28"
          height="14"
          fill="none"
          className="-mt-1 animate-[swArrow_1.6s_ease-in-out_0.25s_infinite]
                     opacity-50
                     drop-shadow-[0_0_4px_rgba(239,1,186,0.7)]"
        >
          <polyline
            points="2,2 12,10 22,2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-sw-magenta"
          />
        </svg>

        {/* Pulse ping behind arrows */}
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2
                     w-6 h-6 rounded-full
                     bg-sw-cyan/10
                     animate-ping"
        />
      </span>
    </button>
  );
}