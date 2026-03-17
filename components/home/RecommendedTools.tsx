"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { recommendedTools } from "@/data/home";
import SectionHeader from "./SectionHeader";

export default function RecommendedTools() {
  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// herramientas recomendadas"
        title="Tools"
        accentColor="#F77200"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendedTools.map((tool, i) => (
          <motion.a
            key={tool.name}
            href={tool.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group relative bg-black/40 backdrop-blur-sm border border-white/[0.08]
                       rounded-xl p-5 transition-all duration-300 block
                       hover:border-opacity-40"
            style={
              {
                "--tool-color": tool.color,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${tool.color}66`;
              e.currentTarget.style.boxShadow = `0 0 20px ${tool.color}22, inset 0 0 20px ${tool.color}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            {/* Tool icon placeholder - using first letter */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 font-heading text-xl font-bold"
              style={{
                backgroundColor: `${tool.color}18`,
                color: tool.color,
                border: `1px solid ${tool.color}30`,
              }}
            >
              {tool.name.charAt(0)}
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading text-base font-semibold text-white mb-1">
                  {tool.name}
                </h3>
                <p className="font-body text-sm text-white/50 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0 mt-1" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
