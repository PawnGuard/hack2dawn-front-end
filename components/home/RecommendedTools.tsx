"use client";

import { recommendedTools } from "@/data/home";
import SectionHeader from "@/components/shared/SectionHeader";
import { CtfCard } from "@/components/shared/CtfCard";

const TOOL_STYLES: Record<string, { iconClass: string; colorClass: string; metaColorClass: string }> = {
  Docker: { iconClass: "hn hn-users-solid", colorClass: "text-cyan-300", metaColorClass: "text-cyan-300/80" },
  "Kali Linux": { iconClass: "hn hn-user-solid", colorClass: "text-purple", metaColorClass: "text-purple/80" },
  "Burp Suite": { iconClass: "hn hn-flag-solid", colorClass: "text-orange", metaColorClass: "text-orange/80" },
  Wireshark: { iconClass: "hn hn-calender-solid", colorClass: "text-yellow", metaColorClass: "text-yellow/80" },
  CyberChef: { iconClass: "hn hn-trophy-solid", colorClass: "text-pink", metaColorClass: "text-pink/80" },
  Ghidra: { iconClass: "hn hn-flag-solid", colorClass: "text-red-400", metaColorClass: "text-red-400/80" },
};

export default function RecommendedTools() {
  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// herramientas recomendadas"
        title="Tools"
        accentColor="#F77200"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
        {recommendedTools.map((tool, i) => {
          const styleMeta = TOOL_STYLES[tool.name] ?? {
            iconClass: "hn hn-user-solid",
            colorClass: "text-white/80",
            metaColorClass: "text-white/60",
          };

          return (
            <CtfCard
              key={tool.name}
              label={tool.name.toLowerCase()}
              title={tool.name}
              description={tool.description}
              accentColor={tool.color}
              icon={
                <i
                  className={`${styleMeta.iconClass} ${styleMeta.colorClass} text-lg`}
                  aria-hidden="true"
                />
              }
              href={tool.downloadUrl}
              animDelay={i * 0.08}
            >
              <div className={`mt-3 flex items-center gap-1 font-mono text-[11px] ${styleMeta.metaColorClass}`}>
                <span className="text-xs">&gt;</span>
                <span>Descargar</span>
              </div>
            </CtfCard>
          );
        })}
      </div>
    </div>
  );
}
