"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  Users,
  Download,
  Terminal,
  Flag,
  Send,
} from "lucide-react";
import { howItWorksSteps } from "@/data/home";
import SectionHeader from "./SectionHeader";

const iconMap: Record<string, React.ElementType> = {
  UserPlus,
  Users,
  Download,
  Terminal,
  Flag,
  Send,
};

export default function HowItWorks() {
  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// como funciona"
        title="How It Works"
        accentColor="#EF01BA"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {howItWorksSteps.map((step, i) => {
          const Icon = iconMap[step.icon];
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group bg-black/40 backdrop-blur-sm border border-white/[0.08]
                         rounded-xl p-6 hover:border-pink/30 transition-colors duration-300"
            >
              {/* Step number */}
              <span
                className="font-display text-5xl font-bold opacity-20 absolute top-4 right-4"
                style={{
                  color: "#EF01BA",
                  textShadow: "0 0 12px #EF01BA44",
                }}
              >
                {String(step.number).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-pink/10 flex items-center justify-center mb-4">
                {Icon && <Icon className="w-5 h-5 text-pink" />}
              </div>

              {/* Content */}
              <h3 className="font-heading text-lg font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="font-body text-sm text-white/60 leading-relaxed">
                {step.description}
              </p>

              {/* Connection dot */}
              {i < howItWorksSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink/40" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
