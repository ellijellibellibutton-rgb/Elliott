export default function MovementBadge({ movement }: { movement: number | null }) {
  if (movement === null) {
    return <span className="text-xs font-medium text-slate-400">NEW</span>;
  }
  if (movement === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
        <span aria-hidden>▬</span> 0
      </span>
    );
  }
  if (movement > 0) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold"
        style={{ color: "var(--status-good)" }}
      >
        <span aria-hidden>▲</span> {movement}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold"
      style={{ color: "var(--status-critical)" }}
    >
      <span aria-hidden>▼</span> {Math.abs(movement)}
    </span>
  );
}
