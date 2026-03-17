"use client";

import { useState, useEffect } from "react";
import { getCtfState } from "@/lib/ctf-state";
import type { CtfState } from "@/types/ctf";

export function useCtfState(): CtfState | null {
  const [state, setState] = useState<CtfState | null>(null);

  useEffect(() => {
    const update = () => setState(getCtfState());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
