"use client";

import { useState, useEffect, useCallback } from "react";
import { msToCountdown } from "@/lib/ctf-state";
import type { CountdownTime } from "@/types/ctf";

export function useCountdown(targetDate: Date | null): CountdownTime | null {
  const [time, setTime] = useState<CountdownTime | null>(null);

  const recalc = useCallback(() => {
    if (!targetDate) return;
    const ms = targetDate.getTime() - Date.now();
    setTime(msToCountdown(ms));
  }, [targetDate]);

  useEffect(() => {
    if (!targetDate) return;

    recalc();
    const id = setInterval(recalc, 1000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") recalc();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [targetDate, recalc]);

  return time;
}
