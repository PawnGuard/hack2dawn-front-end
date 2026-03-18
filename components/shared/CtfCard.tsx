"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const CUT = 18; // px — bottom-right corner cut size

export interface CtfCardProps {
  /** Short label shown in the tab above the card (e.g. "paso 01", "docker", "regla") */
  label: string;
  /** Card heading */
  title: string;
  /** Body text */
  description: string;
  /** Hex accent colour — drives label, border, icon bg, cut-corner tint */
  accentColor?: string;
  /** Icon element rendered in the card */
  icon?: React.ReactNode;
  /** Ghost step/index shown in large font behind the content */
  badge?: string;
  /** Makes the card an <a> link */
  href?: string;
  /** framer-motion whileInView delay (seconds) for stagger animations */
  animDelay?: number;
  /** Slot for extra content rendered below the description */
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CtfCard({
  label,
  title,
  description,
  accentColor = "#EF01BA",
  icon,
  badge,
  href,
  animDelay = 0,
  children,
  className,
  onClick,
}: CtfCardProps) {
  const Tag = href ? "a" : "div";
  const linkProps = href
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: animDelay }}
      className={cn("relative mt-6", className)}
      onClick={onClick}
    >
      {/* ── Label tab (sutera.ch-inspired) ── */}
      <div
        className="absolute -top-[1.55rem] left-0 z-20 font-mono text-[10px] uppercase tracking-widest px-[0.55em] py-[0.22em] leading-none select-none"
        style={{
          backgroundColor: accentColor,
          color: "#0a0006",
          clipPath: "polygon(0 0, 100% 0, calc(100% - 5px) 100%, 0 100%)",
        }}
      >
        {label}
      </div>

      <Tag
        {...linkProps}
        className={cn(
          "relative block w-full",
          "bg-black/60 backdrop-blur-sm",
          href && "cursor-pointer",
        )}
        style={{
          clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${CUT}px), calc(100% - ${CUT}px) 100%, 0 100%)`,
          border: `1px solid ${accentColor}28`,
        }}
      >
        {/* Accent line — top edge */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ backgroundColor: `${accentColor}90` }}
        />

        {/* × cross decoration — top-right (sutera.ch detail) */}
        <div
          className="absolute top-[7px] right-[7px] opacity-35 pointer-events-none"
          style={{ color: accentColor }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="0.5" y="0.5" width="12" height="12" stroke="currentColor" strokeWidth="0.8" />
            <line x1="3.5" y1="3.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
            <line x1="9.5" y1="3.5" x2="3.5" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        </div>

        {/* Ghost badge */}
        {badge && (
          <span
            className="absolute top-3 right-5 font-display text-[4.5rem] font-bold leading-none select-none pointer-events-none"
            style={{ color: accentColor, opacity: 0.06 }}
          >
            {badge}
          </span>
        )}

        {/* ── Main content ── */}
        <div className="relative p-5 pt-6">

          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={70}
            inactiveZone={0.01}
          />
          
          <div className="relative z-10 flex flex-col gap-4">

            {icon && (
              <div
                className="w-10 h-10 flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${accentColor}18`,
                  border: `1px solid ${accentColor}35`,
                }}
              >
                {icon}
              </div>
            )}

            <h3 className="font-heading text-base font-semibold text-white pr-5 leading-snug">
              {title}
            </h3>
            <p className="font-body text-sm text-white/55 leading-relaxed">
              {description}
            </p>

            {children}
          </div>
        </div>


        {/* Cut-corner accent tint */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: `${CUT}px`,
            height: `${CUT}px`,
            background: `linear-gradient(135deg, transparent 45%, ${accentColor}40 100%)`,
          }}
        />
      </Tag>
    </motion.div>
  );
}
