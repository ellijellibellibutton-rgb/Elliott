import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: { box: "h-7 w-7", icon: 14 },
  md: { box: "h-10 w-10", icon: 18 },
  lg: { box: "h-14 w-14", icon: 26 },
};

/**
 * A consistent colored icon chip used across the app in place of emoji —
 * a lucide icon on a soft gradient tint, or a solid gradient for hero
 * treatments via `solid`.
 */
export default function IconBadge({
  icon: Icon,
  color = "#2a78d6",
  size = "md",
  solid = false,
  className,
}: {
  icon: LucideIcon;
  color?: string;
  size?: "sm" | "md" | "lg";
  solid?: boolean;
  className?: string;
}) {
  const { box, icon } = SIZES[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl",
        box,
        className
      )}
      style={
        solid
          ? { background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "white" }
          : { background: `${color}1a`, color }
      }
    >
      <Icon size={icon} strokeWidth={2.25} />
    </span>
  );
}
