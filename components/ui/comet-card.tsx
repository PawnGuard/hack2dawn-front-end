"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CometCardProps {
  children: React.ReactNode;
  className?: string;
  /** Hex colour of the comet beam */
  cometColor?: string;
  /** Seconds per full rotation */
  duration?: number;
}

/**
 * Wraps any content with a continuously-rotating comet gradient that
 * appears as an animated glowing border.
 *
 * Technique:
 *  - Outer div: overflow-hidden + 1.5px padding  →  only the thin gap shows the gradient
 *  - Rotating conic-gradient div: inset -200%    →  covers all edges on rotation
 *  - Inner div (z-10): content fills the padding gap, masking the gradient inside
 */
export function CometCard({
  children,
  className,
  cometColor = "#EF01BA",
  duration = 3,
}: CometCardProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ padding: "1.5px" }}
    >
      {/* Rotating comet beam */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          inset: "-200%",
          background: `conic-gradient(
            from 0deg at 50% 50%,
            transparent        0deg,
            transparent      335deg,
            ${cometColor}11  342deg,
            ${cometColor}66  350deg,
            ${cometColor}    354deg,
            #ffffff           355.5deg,
            ${cometColor}    357deg,
            transparent      360deg
          )`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />

      {/* Content sits above the gradient; fills the 1.5px padded area */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
