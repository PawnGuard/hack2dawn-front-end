import type { CtfPhase, CtfConfig, CtfState, CountdownTime } from "@/types/ctf";

export function getCtfConfig(): CtfConfig {
  const startStr = process.env.NEXT_PUBLIC_EVENT_START;
  const endStr = process.env.NEXT_PUBLIC_EVENT_END;

  const fallbackStart = new Date("2026-05-09T21:00:00Z");
  const fallbackEnd = new Date("2026-05-10T07:00:00Z");

  return {
    start: startStr ? new Date(startStr) : fallbackStart,
    end: endStr ? new Date(endStr) : fallbackEnd,
    name: "CTF 2026 · Hack2Dawn",
  };
}

export function getCtfPhase(now: Date, config: CtfConfig): CtfPhase {
  if (now < config.start) return "before";
  if (now > config.end) return "after";
  return "during";
}

export function getCtfState(now?: Date): CtfState {
  const config = getCtfConfig();
  const current = now ?? new Date();
  const phase = getCtfPhase(current, config);

  let msRemaining: number;
  if (phase === "before") {
    msRemaining = config.start.getTime() - current.getTime();
  } else if (phase === "during") {
    msRemaining = config.end.getTime() - current.getTime();
  } else {
    msRemaining = 0;
  }

  const SIXTY_MINUTES = 60 * 60 * 1000;
  const TEN_MINUTES = 10 * 60 * 1000;

  return {
    phase,
    config,
    msRemaining,
    isUrgent: phase === "during" && msRemaining <= SIXTY_MINUTES,
    isCritical: phase === "during" && msRemaining <= TEN_MINUTES,
  };
}

export function msToCountdown(ms: number): CountdownTime {
  const clamped = Math.max(ms, 0);
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped % 86_400_000) / 3_600_000),
    minutes: Math.floor((clamped % 3_600_000) / 60_000),
    seconds: Math.floor((clamped % 60_000) / 1_000),
    totalMs: clamped,
  };
}
