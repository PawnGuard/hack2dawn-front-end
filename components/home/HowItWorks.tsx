"use client";

import {
  UserPlus,
  Users,
  Download,
  Terminal,
  Flag,
  Send,
} from "lucide-react";
import { howItWorksSteps } from "@/data/home";
import SectionHeader from "@/components/shared/SectionHeader";
import { CtfCard } from "@/components/shared/CtfCard";

const ICONS: Record<string, React.ElementType> = {
  UserPlus,
  Users,
  Download,
  Terminal,
  Flag,
  Send,
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
          const Icon = ICONS[step.icon];
          return (
            <CtfCard
              key={step.number}
              label={`paso ${step.number}`}
              title={step.title}
              description={step.description}
              accentColor={ACCENT}
              icon={
                Icon && (
                  <Icon className="w-5 h-5" style={{ color: ACCENT }} />
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
