"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Minus, Trophy, Flag, Lock } from "lucide-react";
import { useCtfState } from "@/hooks/useCtfState";
import { usePollingData } from "@/hooks/usePollingData";
import { fetchPublicScoreboardAll, fetchScoreboard } from "@/lib/api/scoreboard";
import { getTeamColor } from "@/lib/team-color";
import SectionHeader from "./SectionHeader";
import styles from "./ScoreboardTop10.module.css";
import type { ScoreboardResponse } from "@/types/scoreboard";

// ── Ember canvas ──────────────────────────────────────────────────────────────

type Ember = {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number; decay: number;
  color: string; glitch: boolean;
};

const EMBER_COLORS = [
  "#EF01BA", "#940992", "#FEF759",
  "#F77200", "#00f0ff", "#ff006c",
];

function EmberCanvas({ active, yPositions }: { active: boolean; yPositions: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<Ember[]>([]);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frame = () => {
      if (canvas.width  !== canvas.clientWidth)  canvas.width  = canvas.clientWidth;
      if (canvas.height !== canvas.clientHeight) canvas.height = canvas.clientHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (active && yPositions.length > 0) {
        const count = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < count; i++) {
          const glitch = Math.random() < 0.28;
          const rowY   = yPositions[Math.floor(Math.random() * yPositions.length)];
          embersRef.current.push({
            x:     Math.random() * canvas.width,
            y:     rowY + (Math.random() - 0.5) * 28,
            vx:    (Math.random() - 0.5) * 3.2,
            vy:    -(Math.random() * 2.8 + 0.6),
            size:  glitch ? Math.random() * 10 + 2 : Math.random() * 2.5 + 0.8,
            alpha: 0.75 + Math.random() * 0.25,
            decay: 0.013 + Math.random() * 0.017,
            color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
            glitch,
          });
        }
      }

      embersRef.current = embersRef.current.filter(e => e.alpha > 0.01);

      for (const e of embersRef.current) {
        e.x  += e.vx;
        e.y  += e.vy;
        e.vy -= 0.045;
        e.alpha -= e.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, e.alpha);

        if (e.glitch) {
          const jx = (Math.random() - 0.5) * 7;
          ctx.fillStyle = e.color;
          ctx.fillRect(e.x + jx, e.y, e.size * 4.5, e.size * 0.65);
          ctx.globalAlpha = Math.max(0, e.alpha * 0.38);
          ctx.fillStyle   = e.color === "#00f0ff" ? "#ff006c" : "#00f0ff";
          ctx.fillRect(e.x + jx + 3, e.y, e.size * 4.5, e.size * 0.65);
        } else {
          ctx.shadowBlur  = 9;
          ctx.shadowColor = e.color;
          ctx.fillStyle   = e.color;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      embersRef.current = [];
    };
  }, [active, yPositions]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PositionIndicator({ direction }: { direction: "up" | "down" | null }) {
  if (direction === "up")
    return (
      <span className={`${styles.positionUp} ${styles.positionBounce}`}>
        <ChevronUp className="w-3.5 h-3.5" />
      </span>
    );
  if (direction === "down")
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

function ProHackerBadge() {
  return (
    <span className={`${styles.badge} ${styles.proHackerBadge}`}>
      <span className={styles.skullIcon}>💀</span>
      pro hacker
    </span>
  );
}

function EmergingDangerBadge() {
  return (
    <span className={`${styles.badge} ${styles.emergingDangerBadge}`}>
      ⚡ emerging danger
    </span>
  );
}

function WatchingYouBadge() {
  return (
    <span className={`${styles.badge} ${styles.watchingYouBadge}`}>
      <span className={styles.eyeIcon}>👁</span>
      i&apos;m watching you
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = { variant?: "top10" | "all" };

export default function ScoreboardTop10({ variant = "top10" }: Props) {
  const ctf = useCtfState();
  const fetcher = useCallback(() => {
    return variant === "all" ? fetchPublicScoreboardAll() : fetchScoreboard();
  }, [variant]);

  const enabled    = Boolean(ctf && ctf.phase !== "before");
  const intervalMs = ctf?.phase === "during" ? 3_000 : -1;

  const { data, isLoading } = usePollingData<ScoreboardResponse>(
    fetcher, intervalMs, enabled
  );

  const isLocked  = data?.locked === true || ctf?.phase === "after";
  const teams     = data?.teams ?? [];
  const showFlags = variant === "top10";

  // ── position-change glitch + embers ───────────────
  const containerRef  = useRef<HTMLDivElement>(null);
  const rowRefs       = useRef<Map<string, HTMLDivElement>>(new Map());

  const [glitchingTeams, setGlitchingTeams] = useState<Set<string>>(new Set());
  const [glitchYPositions, setGlitchYPositions] = useState<number[]>([]);
  const [teamDirections, setTeamDirections] = useState<Map<string, "up" | "down">>(new Map());

  const prevPositions = useRef<Map<string, number>>(new Map());
  const glitchTimers  = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!teams.length) return;

    if (isLocked) {
      teams.forEach((team) => {
        prevPositions.current.set(String(team.teamId), team.position);
      });
      return;
    }

    const newGlitching: string[] = [];
    const directionUpdates: Array<[string, "up" | "down"]> = [];

    teams.forEach((team) => {
      const id      = String(team.teamId);
      const lastPos = prevPositions.current.get(id);

      if (lastPos !== undefined && team.position !== lastPos) {
        if (team.position < lastPos) {
          directionUpdates.push([id, "up"]);
          newGlitching.push(id);
          const existing = glitchTimers.current.get(id);
          if (existing) clearTimeout(existing);
          const timer = setTimeout(() => {
            setGlitchingTeams((prev) => { const n = new Set(prev); n.delete(id); return n; });
            glitchTimers.current.delete(id);
          }, 10_000);
          glitchTimers.current.set(id, timer);
        } else {
          directionUpdates.push([id, "down"]);
          if (lastPos <= 3 && team.position === 4) {
            new Audio("/sounds/metal_pipe.mp3").play().catch(() => {});
          }
        }
      }
      prevPositions.current.set(id, team.position);
    });

    if (directionUpdates.length > 0)
      setTeamDirections((prev) => { const n = new Map(prev); directionUpdates.forEach(([id, d]) => n.set(id, d)); return n; });

    if (newGlitching.length > 0)
      setGlitchingTeams((prev) => new Set([...prev, ...newGlitching]));
  }, [teams, isLocked]);

  // sync ember Y positions from DOM whenever glitching set changes
  useEffect(() => {
    if (!glitchingTeams.size) {
      setGlitchYPositions([]);
      return;
    }
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const ys = Array.from(glitchingTeams).flatMap((id) => {
      const el = rowRefs.current.get(id);
      if (!el) return [];
      const rect = el.getBoundingClientRect();
      return [rect.top - containerRect.top + rect.height / 2];
    });

    setGlitchYPositions(ys);
  }, [glitchingTeams]);

  useEffect(() => {
    const timers = glitchTimers.current;
    return () => { timers.forEach((t) => clearTimeout(t)); };
  }, []);

  useEffect(() => {
    if (!isLocked) return;
    glitchTimers.current.forEach((t) => clearTimeout(t));
    glitchTimers.current.clear();
    setGlitchingTeams(new Set());
    setTeamDirections(new Map());
  }, [isLocked]);

  // ── placeholders ───────────────────────────────────
  const placeholder = (message: string) => (
    <div className="flex items-center justify-center h-48 rounded-xl border border-white/[0.06] bg-black/30">
      <p className="font-body text-white/40 text-sm text-center px-4">{message}</p>
    </div>
  );

  const anyGlitching = glitchingTeams.size > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// scoreboard"
        title={variant === "all" ? "Resultados" : "Top 10"}
        accentColor="#EF01BA"
      />

      {ctf?.phase === "before"
        ? placeholder(`El evento aún no inicia. Comienza: ${ctf.config.start.toLocaleString("es-MX")}`)
        : null}

      {ctf?.phase === "before" ? null : isLoading && !teams.length ? (
        <div className="flex items-center justify-center h-48 rounded-xl border border-white/[0.06] bg-black/30">
          <div className="w-5 h-5 border-2 border-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        placeholder("Aún no hay datos de scoreboard")
      ) : (
        <div
          ref={containerRef}
          className={[
            "rounded-xl border border-white/[0.06] bg-black/30 overflow-hidden relative",
            anyGlitching ? styles.containerHovered : "",
            isLocked ? styles.lockedContainer : "",
          ].join(" ")}
        >
          <EmberCanvas active={anyGlitching} yPositions={glitchYPositions} />

          {isLocked && (
            <div className={styles.lockedBanner}>
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>// resultados finales · scoreboard bloqueado</span>
            </div>
          )}

          {/* header */}
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
              const id        = String(team.teamId);
              const teamColor = getTeamColor(team.teamName);
              const isGlitching = glitchingTeams.has(id);

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
                  ref={(el) => {
                    if (el) rowRefs.current.set(id, el as HTMLDivElement);
                    else rowRefs.current.delete(id);
                  }}
                  className={[
                    "grid grid-cols-[2.5rem_1fr_4.5rem]",
                    "sm:grid-cols-[3rem_2rem_1fr_5rem]",
                    "md:grid-cols-[4rem_2.5rem_1fr_6rem]",
                    "gap-2 px-3 sm:px-4 md:px-6",
                    "py-3 border-b border-white/[0.03]",
                    "hover:bg-white/[0.04] transition-colors relative",
                    isGlitching ? styles.glitchRow : "",
                  ].join(" ")}
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
                    <PositionIndicator direction={teamDirections.get(id) ?? null} />
                  </span>

                  <span className="font-heading text-sm text-white flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: teamColor }}
                      aria-hidden
                    />
                    <span className={`truncate ${isGlitching ? styles.glitchText : ""}`}>
                      {team.teamName}
                    </span>
                    {team.position === 1 && <ProHackerBadge />}
                    {team.position === 2 && <EmergingDangerBadge />}
                    {team.position === 3 && <WatchingYouBadge />}
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
