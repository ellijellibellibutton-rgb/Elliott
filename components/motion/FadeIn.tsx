"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps server-rendered content with an entrance animation. Lets pages
 * stay server components (direct Prisma fetches) while still getting the
 * same motion treatment as fully client-rendered pages.
 */
export default function FadeIn({
  children,
  delay = 0,
  y = 14,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
