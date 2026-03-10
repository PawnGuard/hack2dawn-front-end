"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+[]{}|;<>?,./`~";

function generateRandomString(length: number): string {
  return Array.from(
    { length },
    () => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
  ).join("");
}

type EvervaultCardProps = {
  text?: string;
  time?: string;
  description?: string;
  /** Centered body text — displayed in the middle of the card with paragraph styling */
  body?: string;
  className?: string;
  /** Color of the scrambled background characters. Defaults to #4ade80 (green-400) */
  charColor?: string;
  /** Color of the center text. Defaults to #ffffff */
  textColor?: string;
  /** Externally force the hover/scramble animation on (e.g. when the car passes under). */
  forceHover?: boolean;
};

export function EvervaultCard({
  text,
  time,
  description,
  body,
  className,
  charColor = "#4ade80",
  textColor = "#ffffff",
  forceHover = false,
}: EvervaultCardProps) {
  const [randomString, setRandomString] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const active = isHovering || forceHover;

  useEffect(() => {
    // Initialize on the client to avoid SSR/client mismatch
    setRandomString(generateRandomString(1500));
  }, []);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setRandomString(generateRandomString(1500));
      }, 75);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  return (
    <div
      className={cn(
        "p-0.5 flex items-center justify-center w-full h-full relative",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="relative flex flex-col h-full w-full overflow-hidden rounded-2xl transition-all duration-300"
        style={active ? {
          boxShadow: `0 0 20px ${charColor}55, 0 0 40px ${charColor}22`,
          background: `linear-gradient(135deg, ${charColor}11 0%, transparent 60%)`,
        } : {}}
      >
        {/* Scramble background — covers the whole card */}
        <div
          aria-hidden="true"
          className="absolute inset-0 text-[0.6rem] font-mono font-bold break-all select-none pointer-events-none whitespace-pre-wrap transition-[opacity] duration-300"
          style={{
            opacity: active ? 0.7 : 0.3,
            color: charColor,
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)",
          }}
        >
          {randomString}
        </div>

        {/* Top: main text */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 pt-4">
          {text && (
            <span
              className="font-bold text-5xl text-center transition-all duration-300"
              style={{
                color: textColor,
                textShadow: active ? `0 0 20px ${charColor}99` : "none",
              }}
            >
              {text}
            </span>
          )}
          {body && !text && (
            <p
              className="text-sm sm:text-base leading-relaxed text-center px-2 transition-all duration-300"
              style={{
                color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)",
              }}
            >
              {body}
            </p>
          )}
        </div>

        {/* Middle: time */}
        {time && (
          <div className="relative z-10 flex items-center justify-center px-4 py-10">
            <span
              className="font-bold text-7xl animate-pulse"
              style={{ color: charColor }}
            >
              {time}
            </span>
          </div>
        )}

        {/* Bottom footer: description */}
        {description && (
          <div
            className="relative z-10 px-4 py-3 mt-auto border-t"
            style={{ borderColor: `${charColor}33` }}
          >
            <p className="text-s text-white/70 font-light leading-relaxed whitespace-normal">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Icon({
  className,
  ...rest
}: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
      {...rest}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m6-6H6"
      />
    </svg>
  );
}
