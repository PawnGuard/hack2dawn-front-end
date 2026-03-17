"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Minus, Trophy, Flag } from "lucide-react";
import { useCtfState } from "@/hooks/useCtfState";
import { usePollingData } from "@/hooks/usePollingData";
import { fetchScoreboard } from "@/lib/api/scoreboard";
import SectionHeader from "./SectionHeader";
import styles from "./ScoreboardTop10.module.css";
import type { ScoreboardResponse, TeamScore } from "@/types/scoreboard";

const PODIUM_COLORS = ["#EF01BA", "#F77200", "#FEF759"];

function PositionIndicator({ team }: { team: TeamScore }) {
  if (team.previousPosition < 0) return null;
  const diff = team.previousPosition - team.position;
  if (diff > 0)
    return (
      <span className={`${styles.positionUp} ${styles.positionBounce}`}>
        <ChevronUp className="w-3.5 h-3.5" />
      </span>
    );
  if (diff < 0)
    return (
      <span className={`${styles.positionDown} ${styles.positionBounce}`}>
        <ChevronDown className="w-3.5 h-3.5" />
      </span>
    );
  return (
    <span className={styles.positionSame}>
      <Minus className="w-3.5 h-3.5" />
    </span>
  );
}

export default function ScoreboardTop10() {
  const ctf = useCtfState();
  const fetcher = useCallback(() => fetchScoreboard(), []);
  const { data, isLoading } = usePollingData<ScoreboardResponse>(
    fetcher,
    15_000,
    ctf?.phase !== "before"
  );

  const teams = data?.teams ?? [];

  const placeholder = (message: string) => (
    <div className="flex items-center justify-center h-48 rounded-xl border border-white/[0.06] bg-black/30">
      <p className="font-body text-white/40 text-sm text-center px-4">{message}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader label="// scoreboard" title="Top 10" accentColor="#EF01BA" />

      {ctf?.phase === "before" ? (
        placeholder("El scoreboard estará disponible cuando inicie el CTF")
      ) : isLoading && !teams.length ? (
        <div className="flex items-center justify-center h-48 rounded-xl border border-white/[0.06] bg-black/30">
          <div className="w-5 h-5 border-2 border-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-black/30 overflow-hidden">
          <div
            className="
              grid grid-cols-[2.5rem_1fr_4.5rem]
              sm:grid-cols-[3rem_2rem_1fr_5rem_4rem]
              md:grid-cols-[4rem_2.5rem_1fr_6rem_5rem]
              gap-2 px-3 sm:px-4 md:px-6
              py-3 border-b border-white/[0.06]
              text-white/40 font-mono text-[11px] uppercase tracking-wider
            "
          >
            <span>#</span>
            <span className="hidden sm:block" />
            <span>Equipo</span>
            <span className="text-right">Pts</span>
            <span className="hidden sm:flex items-center justify-end gap-1">
              <Flag className="w-3 h-3" /> Flags
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {teams.map((team) => {
              const isPodium = team.position <= 3;
              const podiumColor = isPodium
                ? PODIUM_COLORS[team.position - 1]
                : undefined;

              return (
                <motion.div
                  key={team.teamId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{
                    layout: { type: "spring", stiffness: 350, damping: 30 },
                    opacity: { duration: 0.3 },
                  }}
                  className="
                    grid grid-cols-[2.5rem_1fr_4.5rem]
                    sm:grid-cols-[3rem_2rem_1fr_5rem_4rem]
                    md:grid-cols-[4rem_2.5rem_1fr_6rem_5rem]
                    gap-2 px-3 sm:px-4 md:px-6
                    py-3 border-b border-white/[0.03]
                    hover:bg-white/[0.04] transition-colors relative
                  "
                >
                  {isPodium && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5"
                      style={{ backgroundColor: podiumColor }}
                    />
                  )}

                  <span
                    className="font-mono text-sm font-bold flex items-center gap-0.5"
                    style={
                      podiumColor
                        ? { color: podiumColor }
                        : { color: "rgba(244, 237, 242, 0.45)" }
                    }
                  >
                    {team.position === 1 && (
                      <Trophy className="w-3 h-3 shrink-0" style={{ color: podiumColor }} />
                    )}
                    {team.position}
                  </span>

                  <span className="hidden sm:flex items-center">
                    <PositionIndicator team={team} />
                  </span>

                  <span className="font-heading text-sm text-white truncate flex items-center">
                    {team.teamName}
                  </span>

                  <span className="font-mono text-sm text-white/80 text-right flex items-center justify-end tabular-nums">
                    {team.score.toLocaleString()}
                  </span>

                  <span className="hidden sm:flex font-mono text-sm text-white/50 items-center justify-end tabular-nums">
                    {team.flagsCaptured}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
