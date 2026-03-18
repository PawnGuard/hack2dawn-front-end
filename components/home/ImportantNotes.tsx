"use client";

import {
  Flag,
  Users,
  ShieldAlert,
  MessageCircle,
} from "lucide-react";
import { importantNotes } from "@/data/home";
import SectionHeader from "@/components/shared/SectionHeader";
import { CtfCard } from "@/components/shared/CtfCard";

const ICONS: Record<string, React.ElementType> = {
  Flag,
  Users,
  ShieldAlert,
  MessageCircle,
};

export default function ImportantNotes() {
  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// puntos importantes"
        title="Key Rules"
        accentColor="#FEF759"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {importantNotes.map((note, i) => {
          const Icon = ICONS[note.icon];
          return (
            <CtfCard
              key={note.title}
              label="regla"
              title={note.title}
              description={note.content}
              accentColor={note.accentColor}
              icon={
                Icon && (
                  <Icon
                    className="w-5 h-5"
                    style={{ color: note.accentColor }}
                  />
                )
              }
              animDelay={i * 0.1}
            />
          );
        })}
      </div>
    </div>
  );
}
