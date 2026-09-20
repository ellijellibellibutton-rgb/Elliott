import clsx from "clsx";
import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "var(--series-1)",
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={clsx("card flex flex-col gap-1 p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {icon && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
            style={{ background: `${accent}1a`, color: accent }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold tabular-nums text-navy-900 sm:text-3xl">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
