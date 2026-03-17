"use client";

import { motion } from "framer-motion";
import {
  Flag,
  Users,
  ShieldAlert,
  MessageCircle,
} from "lucide-react";
import { importantNotes } from "@/data/home";
import SectionHeader from "./SectionHeader";

const iconMap: Record<string, React.ElementType> = {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {importantNotes.map((note, i) => {
          const Icon = iconMap[note.icon];
          return (
            <motion.div
              key={note.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative bg-black/40 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 overflow-hidden"
            >
              {/* Left accent border */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: note.accentColor }}
              />

              <div className="flex items-start gap-4 pl-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${note.accentColor}18` }}
                >
                  {Icon && (
                    <Icon
                      className="w-5 h-5"
                      style={{ color: note.accentColor }}
                    />
                  )}
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold text-white mb-1">
                    {note.title}
                  </h3>
                  <p className="font-body text-sm text-white/55 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
