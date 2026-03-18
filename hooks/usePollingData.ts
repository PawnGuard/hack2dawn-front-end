"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PollingResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function usePollingData<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  enabled: boolean = true
): PollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const result = await fetcher();
      if (!abortRef.current.signal.aborted) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (!abortRef.current?.signal.aborted) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (!abortRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) return;

    doFetch();
    const id = setInterval(doFetch, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") doFetch();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      abortRef.current?.abort();
    };
  }, [enabled, intervalMs, doFetch]);

  return { data, isLoading, error };
}
