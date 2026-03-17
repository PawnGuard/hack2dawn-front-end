"use client";

import React, { useRef } from "react";

const CTF_COLORS = ["#430464", "#940992", "#EF01BA", "#F77200", "#FEF759"];

// 50 columns × 30 rows = 1500 cells covering the full viewport
const COLS = 50;
const ROWS = 30;
const TOTAL = COLS * ROWS;

function Cell() {
  const ref = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    const el = ref.current;
    if (!el) return;
    const color = CTF_COLORS[Math.floor(Math.random() * CTF_COLORS.length)];
    // Instant flash
    el.style.transition = "none";
    el.style.backgroundColor = color;
    // Fade back on the next paint so the "none" transition registers first
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.transition = "background-color 1.5s ease-out";
        ref.current.style.backgroundColor = "transparent";
      })
    );
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      // Pink border at low opacity → subtle grid lines
      className="border-r border-b border-[#EF01BA]/[0.07]"
    />
  );
}

export const Boxes = React.memo(function Boxes() {
  return (
    <div
      className="absolute inset-0"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
    >
      {Array.from({ length: TOTAL }).map((_, i) => (
        <Cell key={i} />
      ))}
    </div>
  );
});
