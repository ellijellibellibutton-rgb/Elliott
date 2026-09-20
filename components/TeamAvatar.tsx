import clsx from "clsx";

export default function TeamAvatar({
  color,
  logo,
  name,
  size = "md",
}: {
  color: string;
  logo?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-7 w-7 text-sm",
    md: "h-10 w-10 text-lg",
    lg: "h-14 w-14 text-2xl",
  }[size];

  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-2 ring-white",
        sizeClasses
      )}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      title={name}
    >
      {logo || name.slice(0, 1)}
    </span>
  );
}
