"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Fetches `url` immediately, then re-polls on an interval and whenever the
 * tab regains focus/visibility, so public pages reflect admin edits made in
 * another session without requiring a manual refresh.
 */
export function useLivePolling<T>(url: string, intervalMs = 20000) {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const urlRef = useRef(url);
  urlRef.current = url;

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(urlRef.current, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as T;
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load data.",
      }));
    }
  }, []);

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true), intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") load(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, intervalMs]);

  return { ...state, refetch: () => load(true) };
}
