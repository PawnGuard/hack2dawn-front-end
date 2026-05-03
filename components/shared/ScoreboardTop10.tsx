"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Minus, Trophy, Flag } from "lucide-react";
import { useCtfState } from "@/hooks/useCtfState";
import { usePollingData } from "@/hooks/usePollingData";
import { fetchPublicScoreboardAll, fetchScoreboard } from "@/lib/api/scoreboard";
import { getTeamColor } from "@/lib/team-color";
import SectionHeader from "./SectionHeader";
import styles from "./ScoreboardTop10.module.css";
import type { ScoreboardResponse, TeamScore } from "@/types/scoreboard";

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

type Props = {
  variant?: "top10" | "all";
};

export default function ScoreboardTop10({ variant = "top10" }: Props) {
  const ctf = useCtfState();
  const fetcher = useCallback(() => {
    return variant === "all" ? fetchPublicScoreboardAll() : fetchScoreboard();
  }, [variant]);

  const enabled = Boolean(ctf && ctf.phase !== "before");
  const intervalMs = ctf?.phase === "during" ? 3_000 : -1;

  const { data, isLoading } = usePollingData<ScoreboardResponse>(
    fetcher,
    intervalMs,
    enabled
  );

  const teams = data?.teams ?? [];
  const showFlags = variant === "top10";

  const placeholder = (message: string) => (
    <div className="flex items-center justify-center h-48 rounded-xl border border-white/[0.06] bg-black/30">
      <p className="font-body text-white/40 text-sm text-center px-4">{message}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// scoreboard"
        title={variant === "all" ? "Resultados" : "Top 10"}
        accentColor="#EF01BA"
      />

      {ctf?.phase === "before" ? (
        placeholder(
          `El evento aún no inicia. Comienza: ${ctf.config.start.toLocaleString("es-MX")}`
        )
      ) : null}

      {ctf?.phase === "before" ? null : isLoading && !teams.length ? (
        <div className="flex items-center justify-center h-48 rounded-xl border border-white/[0.06] bg-black/30">
          <div className="w-5 h-5 border-2 border-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        placeholder("Aún no hay datos de scoreboard")
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-black/30 overflow-hidden">
          <div
            className="
              grid grid-cols-[2.5rem_1fr_4.5rem]
              sm:grid-cols-[3rem_2rem_1fr_5rem]
              md:grid-cols-[4rem_2.5rem_1fr_6rem]
              gap-2 px-3 sm:px-4 md:px-6
              py-3 border-b border-white/[0.06]
              text-white/40 font-mono text-[11px] uppercase tracking-wider
            "
          >
            <span>#</span>
            <span className="hidden sm:block" />
            <span>Equipo</span>
            <span className="text-right">Pts</span>
            {showFlags ? (
              <span className="hidden sm:flex items-center justify-end gap-1">
                <Flag className="w-3 h-3" /> Flags
              </span>
            ) : null}
          </div>

          <AnimatePresence mode="popLayout">
            {teams.map((team) => {
              const teamColor = getTeamColor(team.teamName);

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
                    sm:grid-cols-[3rem_2rem_1fr_5rem]
                    md:grid-cols-[4rem_2.5rem_1fr_6rem]
                    gap-2 px-3 sm:px-4 md:px-6
                    py-3 border-b border-white/[0.03]
                    hover:bg-white/[0.04] transition-colors relative
                  "
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ backgroundColor: teamColor }}
                  />

                  <span
                    className="font-mono text-sm font-bold flex items-center gap-0.5"
                    style={{ color: teamColor }}
                  >
                    {team.position === 1 && (
                      <Trophy className="w-3 h-3 shrink-0" style={{ color: teamColor }} />
                    )}
                    {team.position}
                  </span>

                  <span className="hidden sm:flex items-center">
                    <PositionIndicator team={team} />
                  </span>

                  <span className="font-heading text-sm text-white truncate flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: teamColor }}
                      aria-hidden
                    />
                    {team.teamName}
                  </span>

                  <span className="font-mono text-sm text-white/80 text-right flex items-center justify-end tabular-nums">
                    {team.score.toLocaleString()}
                  </span>

                  {showFlags ? (
                    <span className="hidden sm:flex font-mono text-sm text-white/50 items-center justify-end tabular-nums">
                      {team.flagsCaptured}
                    </span>
                  ) : null}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
