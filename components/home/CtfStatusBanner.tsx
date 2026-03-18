"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useCtfState } from "@/hooks/useCtfState";

export default function CtfStatusBanner() {
  const ctf = useCtfState();

  if (!ctf) return null;

  const showFinished = ctf.phase === "after";
  const showCritical = ctf.isCritical && ctf.phase === "during";

  return (
    <AnimatePresence>
      {showFinished && (
        <motion.div
          key="finished"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden"
        >
          <div
            className="w-full py-4 px-6 text-center"
            style={{
              background:
                "linear-gradient(135deg, #430464 0%, #940992 40%, #EF01BA 100%)",
            }}
          >
            <p className="font-heading text-sm md:text-base text-white font-semibold">
              El CTF ha finalizado. &iexcl;Gracias por participar!
            </p>
            <Link
              href="/scoreboard"
              className="inline-block mt-1 font-mono text-xs text-white/80 underline underline-offset-2 hover:text-white transition-colors"
            >
              Ver scoreboard final &rarr;
            </Link>
          </div>
        </motion.div>
      )}

      {showCritical && (
        <motion.div
          key="critical"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden"
        >
          <div
            className="w-full py-3 px-6 text-center flex items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(90deg, #ff444422 0%, #ff000044 50%, #ff444422 100%)",
              animation: "criticalBannerPulse 1.5s ease-in-out infinite",
            }}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="font-heading text-sm text-red-300 font-semibold">
              &iexcl;&Uacute;ltimos 10 minutos. &iexcl;Env&iacute;a tus flags!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
