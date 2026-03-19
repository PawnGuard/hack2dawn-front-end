"use client";

import { howItWorksSteps } from "@/data/home";
import SectionHeader from "@/components/shared/SectionHeader";
import { CtfCard } from "@/components/shared/CtfCard";

const PIXEL_ICONS: Record<string, { className: string; colorClass: string }> = {
  UserPlus: { className: "hn hn-user-solid", colorClass: "text-pink" },
  Users: { className: "hn hn-users-solid", colorClass: "text-cyan-300" },
  Download: { className: "hn hn-calender-solid", colorClass: "text-orange" },
  Terminal: { className: "hn hn-user-solid", colorClass: "text-purple" },
  Flag: { className: "hn hn-flag-solid", colorClass: "text-yellow" },
  Send: { className: "hn hn-trophy-solid", colorClass: "text-pink" },
};

const ACCENT = "#EF01BA";

export default function HowItWorks() {
  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// como funciona"
        title="How It Works"
        accentColor={ACCENT}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
        {howItWorksSteps.map((step, i) => {
          const pixelIcon = PIXEL_ICONS[step.icon];
          return (
            <CtfCard
              key={step.number}
              label={`paso ${step.number}`}
              title={step.title}
              description={step.description}
              accentColor={ACCENT}
              icon={
                pixelIcon && (
                  <i
                    className={`${pixelIcon.className} ${pixelIcon.colorClass} text-lg`}
                    aria-hidden="true"
                  />
                )
              }
              badge={String(step.number).padStart(2, "0")}
              animDelay={i * 0.08}
            />
          );
        })}
      </div>
    </div>
  );
}
