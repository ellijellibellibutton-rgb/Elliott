"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { Trophy, BarChart3, Scale, Gift, Settings, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Leaderboard", Icon: Trophy },
  { href: "/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/judges-rules", label: "Judges & Rules", Icon: Scale },
  { href: "/prizes-awards", label: "Prizes & Awards", Icon: Gift },
  { href: "/admin", label: "Admin", Icon: Settings },
];

export default function Navbar({ campaignName }: { campaignName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/95 backdrop-blur supports-[backdrop-filter]:bg-navy-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-white shadow-lg shadow-blue-900/30 transition-transform group-hover:scale-105"
            style={{ background: "var(--accent-gradient)" }}
          >
            <Trophy size={18} strokeWidth={2.5} />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-white">{campaignName}</div>
            <div className="text-[11px] font-medium text-slate-400">Corporate Giving Competition</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-150",
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <link.Icon size={15} strokeWidth={2.25} aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-navy-950 px-4 py-2 md:hidden">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  active ? "bg-white/10 text-white" : "text-slate-300"
                )}
              >
                <link.Icon size={16} strokeWidth={2.25} aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
