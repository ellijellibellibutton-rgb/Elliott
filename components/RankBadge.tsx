import clsx from "clsx";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank];
  return (
    <span
      className={clsx(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
        medal
          ? "bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 text-base shadow"
          : "bg-slate-100 text-slate-600"
      )}
    >
      {medal ?? rank}
    </span>
  );
}
