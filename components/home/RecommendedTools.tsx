"use client";

import { ExternalLink } from "lucide-react";
import { recommendedTools } from "@/data/home";
import SectionHeader from "@/components/shared/SectionHeader";
import { CtfCard } from "@/components/shared/CtfCard";

export default function RecommendedTools() {
  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// herramientas recomendadas"
        title="Tools"
        accentColor="#F77200"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
        {recommendedTools.map((tool, i) => (
          <CtfCard
            key={tool.name}
            label={tool.name.toLowerCase()}
            title={tool.name}
            description={tool.description}
            accentColor={tool.color}
            icon={
              <span
                className="font-heading text-base font-bold"
                style={{ color: tool.color }}
              >
                {tool.name.charAt(0)}
              </span>
            }
            href={tool.downloadUrl}
            animDelay={i * 0.08}
          >
            <div
              className="mt-3 flex items-center gap-1 font-mono text-[11px]"
              style={{ color: `${tool.color}80` }}
            >
              <ExternalLink className="w-3 h-3" />
              <span>Descargar</span>
            </div>
          </CtfCard>
        ))}
      </div>
    </div>
  );
}
