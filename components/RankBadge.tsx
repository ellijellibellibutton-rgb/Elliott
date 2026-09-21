"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank];
  return (
    <span className="relative inline-flex">
      {rank === 1 && (
        <motion.span
          className="absolute inset-0 rounded-full bg-amber-300"
          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.5, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span
        className={clsx(
          "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
          medal
            ? "bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 text-base shadow"
            : "bg-slate-100 text-slate-600"
        )}
      >
        {medal ?? rank}
      </span>
    </span>
  );
}
