"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

/**
 * Animates a displayed number smoothly toward `value` whenever it changes —
 * used for stat tiles so live-polled updates feel alive rather than
 * snapping instantly.
 */
export function useCountUp(value: number, duration = 0.8): number {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      prev.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(prev.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return display;
}
