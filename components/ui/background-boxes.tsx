"use client";

import React, { useRef, useEffect, useCallback } from "react";

const CTF_COLORS = ["#430464", "#940992", "#EF01BA", "#F77200", "#FEF759"];

const COLS = 50;
const ROWS = 30;
const TOTAL = COLS * ROWS;

export const Boxes = React.memo(function Boxes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const flashCell = useCallback((el: HTMLDivElement) => {
    const color = CTF_COLORS[Math.floor(Math.random() * CTF_COLORS.length)];
    el.style.transition = "none";
    el.style.backgroundColor = color;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transition = "background-color 1.5s ease-out";
        el.style.backgroundColor = "transparent";
      })
    );
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      // pointer-events: none en el container, así que usamos elementFromPoint
      // temporalmente habilitando pointer-events
      container.style.pointerEvents = "auto";
      const el = document.elementFromPoint(e.clientX, e.clientY);
      container.style.pointerEvents = "none";

      if (el instanceof HTMLDivElement && el.dataset.cell === "1") {
        flashCell(el);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [flashCell]);

  return (
    // pointer-events: none → el scroll llega al documento sin bloquearse
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div
          key={i}
          data-cell="1"
          ref={(el) => { cellRefs.current[i] = el; }}
          className="border-r border-b border-[#EF01BA]/[0.07]"
        />
      ))}
    </div>
  );
});