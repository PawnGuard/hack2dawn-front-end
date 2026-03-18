"use client";

import { EncryptedText } from "@/components/ui/encrypted-text";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  title: string;
  accentColor: string;
  className?: string;
}

export default function SectionHeader({
  label,
  title,
  accentColor,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-12", className)}>
      <span className="block font-mono text-sm tracking-widest opacity-60 mb-2">
        <EncryptedText
          text={label}
          revealDelayMs={30}
          encryptedClassName="opacity-40"
        />
      </span>
      <h2
        className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold"
        style={{
          color: accentColor,
          textShadow: `0 0 8px ${accentColor}, 0 0 24px ${accentColor}99, 0 0 50px ${accentColor}4D`,
        }}
      >
        <EncryptedText
          text={title}
          revealDelayMs={40}
          encryptedClassName="opacity-30"
        />
      </h2>
    </div>
  );
}
