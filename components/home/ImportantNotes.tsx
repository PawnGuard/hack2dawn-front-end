"use client";

import { importantNotes } from "@/data/home";
import SectionHeader from "@/components/shared/SectionHeader";
import { CtfCard } from "@/components/shared/CtfCard";

const PIXEL_ICONS: Record<string, { className: string; colorClass: string }> = {
  Flag: { className: "hn hn-flag-solid", colorClass: "text-pink" },
  Users: { className: "hn hn-users-solid", colorClass: "text-orange" },
  ShieldAlert: { className: "hn hn-trophy-solid", colorClass: "text-yellow" },
  MessageCircle: { className: "hn hn-user-solid", colorClass: "text-purple" },
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
          const iconMeta = PIXEL_ICONS[note.icon];
          return (
            <CtfCard
              key={note.title}
              label="regla"
              title={note.title}
              description={note.content}
              accentColor={note.accentColor}
              icon={
                iconMeta && (
                  <i
                    className={`${iconMeta.className} ${iconMeta.colorClass} text-lg`}
                    aria-hidden="true"
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
