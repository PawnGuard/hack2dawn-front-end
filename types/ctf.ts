export type CtfPhase = "before" | "during" | "after";

export interface CtfConfig {
  start: Date;
  end: Date;
  name: string;
}

export interface CtfState {
  phase: CtfPhase;
  config: CtfConfig;
  msRemaining: number;
  isUrgent: boolean;
  isCritical: boolean;
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}
