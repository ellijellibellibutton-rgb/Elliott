"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useLivePolling } from "@/hooks/useLivePolling";
import { useCountUp } from "@/hooks/useCountUp";
import type { DashboardData, LeaderboardRow } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime, formatPoints } from "@/lib/format";
import TeamAvatar from "@/components/TeamAvatar";
import RankBadge from "@/components/RankBadge";
import MovementBadge from "@/components/MovementBadge";
import IconBadge from "@/components/IconBadge";
import {
  Award,
  TrendingUp,
  CalendarDays,
  DollarSign,
  Gift,
  ListChecks,
  Search,
} from "lucide-react";

type SortKey =
  | "totalPoints"
  | "dollarsRaised"
  | "businessesContacted"
  | "meetings"
  | "pitches"
  | "bonusPoints";

const SORT_LABELS: Record<SortKey, string> = {
  totalPoints: "Points",
  dollarsRaised: "$ Raised",
  businessesContacted: "Businesses",
  meetings: "Meetings",
  pitches: "Pitches",
  bonusPoints: "Bonus",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" },
  }),
};

export default function HomePage() {
  const { data, loading, error, refetch } = useLivePolling<DashboardData>("/api/dashboard", 15000);
  const [sortKey, setSortKey] = useState<SortKey>("totalPoints");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    let list = [...data.leaderboard];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === "asc" ? diff : -diff;
    });
    return list;
  }, [data, sortKey, sortDir, search]);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-2/3 rounded-lg bg-slate-200" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-96 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-lg font-semibold text-red-600">Couldn&apos;t load the dashboard.</p>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <button
          onClick={refetch}
          className="mt-6 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const top3 = data.leaderboard.slice(0, 3);
  const biggestMover = [...data.leaderboard]
    .filter((t) => t.movement !== null)
    .sort((a, b) => (b.movement ?? 0) - (a.movement ?? 0))[0];

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const heroImage = data.settings?.heroImageUrl;

  return (
    <div className="bg-[var(--background)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] text-white">
        {heroImage ? (
          <>
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/90 to-navy-800/85" />
          </>
        ) : (
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
            <div
              className="blob-1 absolute -left-24 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
              style={{ background: "radial-gradient(circle, #6d5ce7, transparent 70%)" }}
            />
            <div
              className="blob-2 absolute -right-16 top-0 h-80 w-80 rounded-full opacity-25 blur-3xl"
              style={{ background: "radial-gradient(circle, #3987e5, transparent 70%)" }}
            />
            <div
              className="blob-1 absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full opacity-20 blur-3xl"
              style={{ background: "radial-gradient(circle, #e05fa8, transparent 70%)", animationDelay: "-8s" }}
            />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-300">
                <LivePulse /> {data.settings?.committeeName ?? "AAPLE Corporate Giving Committee"}
              </p>
              <h1 className="gradient-text mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {data.settings?.campaignName ?? "Corporate Giving Hub"}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
                {data.settings?.campaignDescription ?? ""}
              </p>
            </motion.div>
            {data.currentSprint && (
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={1}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300">
                  Current Sprint
                </p>
                <p className="mt-1 text-lg font-bold">{data.currentSprint.name}</p>
                <p className="mt-1 max-w-xs text-xs text-slate-300">
                  {data.currentSprint.description}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  {formatDate(data.currentSprint.startDate)} – {formatDate(data.currentSprint.endDate)}
                </p>
              </motion.div>
            )}
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={2}
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
          >
            <MiniStat label="Total Points" raw={data.totals.totalPoints} format={formatPoints} />
            <MiniStat label="Dollars Raised" raw={data.totals.totalDollars} format={formatCurrency} />
            <MiniStat label="Businesses" raw={data.totals.businessesContacted} />
            <MiniStat label="Meetings" raw={data.totals.meetings} />
            <MiniStat label="Pitches" raw={data.totals.pitches} />
            <MiniStat label="Teams" raw={data.totals.activeTeams} />
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Top 3 podium */}
        <div className="grid gap-4 sm:grid-cols-3">
          {top3.map((team, idx) => (
            <PodiumCard key={team.teamId} team={team} highlight={idx === 0} index={idx} />
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Leaderboard table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="card overflow-hidden lg:col-span-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                Full Leaderboard
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  <LivePulse color="#0ca30c" /> Live
                </span>
              </h2>
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teams…"
                  className="w-48 rounded-full border border-[var(--border-subtle)] py-1.5 pl-9 pr-3.5 text-sm outline-none transition-shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-semibold">Rank</th>
                    <th className="px-3 py-3 font-semibold">Team</th>
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                      <th
                        key={key}
                        className="cursor-pointer select-none px-3 py-3 text-right font-semibold transition-colors hover:text-navy-900"
                        onClick={() => toggleSort(key)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {SORT_LABELS[key]}
                          {sortKey === key && (
                            <motion.span
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {sortDir === "asc" ? "↑" : "↓"}
                            </motion.span>
                          )}
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-right font-semibold">Move</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {rows.map((team) => (
                      <motion.tr
                        key={team.teamId}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ layout: { duration: 0.4, ease: "easeInOut" }, opacity: { duration: 0.2 } }}
                        className={clsx(
                          "border-b border-[var(--border-subtle)] last:border-0 transition-colors hover:bg-slate-50",
                          team.rank <= 3 && "bg-amber-50/40"
                        )}
                      >
                        <td className="px-5 py-3">
                          <RankBadge rank={team.rank} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <TeamAvatar color={team.color} logo={team.logo} name={team.name} size="sm" />
                            <div>
                              <div className="font-semibold text-navy-900">{team.name}</div>
                              <div className="text-xs text-slate-400">{team.slogan}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-bold tabular-nums text-navy-900">
                          {formatPoints(team.totalPoints)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                          {formatCurrency(team.dollarsRaised)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                          {team.businessesContacted}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                          {team.meetings}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                          {team.pitches}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                          {formatPoints(team.bonusPoints)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <MovementBadge movement={team.movement} />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-sm text-slate-400">
                        No teams match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {data.latestWin && (
              <SidebarCard index={0}>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-600">
                  <IconBadge icon={Award} color="#eda100" size="sm" /> Win of the Week
                </h3>
                <p className="mt-2 text-lg font-bold text-navy-900">{data.latestWin.award.name}</p>
                <p className="text-sm text-slate-600">
                  {data.latestWin.winnerName}
                  {data.latestWin.team ? ` · ${data.latestWin.team.name}` : ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">{data.latestWin.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">
                    +{formatPoints(data.latestWin.bonusPoints)} bonus pts
                  </span>
                  <span className="text-slate-400">{formatDate(data.latestWin.date)}</span>
                </div>
              </SidebarCard>
            )}

            {biggestMover && (
              <SidebarCard index={1}>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-600">
                  <IconBadge icon={TrendingUp} color="#2a78d6" size="sm" /> Biggest Mover
                </h3>
                <div className="mt-2 flex items-center gap-3">
                  <TeamAvatar color={biggestMover.color} logo={biggestMover.logo} name={biggestMover.name} />
                  <div>
                    <p className="font-bold text-navy-900">{biggestMover.name}</p>
                    <MovementBadge movement={biggestMover.movement} />
                  </div>
                </div>
              </SidebarCard>
            )}

            {data.nextMeeting && (
              <SidebarCard index={2}>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-600">
                  <IconBadge icon={CalendarDays} color="#1baf7a" size="sm" /> Next Meeting
                </h3>
                <p className="mt-2 font-bold text-navy-900">{data.nextMeeting.title}</p>
                <p className="text-xs text-slate-500">{formatDateTime(data.nextMeeting.date)}</p>
                {data.nextMeeting.sprintChallenge && (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold">Sprint challenge: </span>
                    {data.nextMeeting.sprintChallenge}
                  </p>
                )}
              </SidebarCard>
            )}

            <SidebarCard index={3}>
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <IconBadge icon={DollarSign} color="#4a3aa7" size="sm" /> Current Scoring
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {data.scoringCategories.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">{c.name}</span>
                    <span className="font-semibold text-navy-900">
                      {c.type === "DOLLAR" ? `${c.pointsPer100} pts / $100` : `${c.pointValue} pts`}
                    </span>
                  </li>
                ))}
              </ul>
            </SidebarCard>

            {data.prizes.length > 0 && (
              <SidebarCard index={4}>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <IconBadge icon={Gift} color="#e87ba4" size="sm" /> Current Prizes
                </h3>
                <ul className="mt-2 space-y-2">
                  {data.prizes.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      <span>{p.icon}</span>
                      <span className="text-slate-700">{p.name}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/prizes-awards"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform hover:gap-1.5 hover:underline"
                >
                  View all prizes →
                </Link>
              </SidebarCard>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 card p-5"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <IconBadge icon={ListChecks} color="#008300" size="sm" /> Recent Activity
          </h2>
          <div className="mt-3 divide-y divide-[var(--border-subtle)]">
            <AnimatePresence initial={false}>
              {data.recentActivity.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <TeamAvatar color={a.team.color} logo={a.team.logo} name={a.team.name} size="sm" />
                    <div>
                      <span className="font-semibold text-navy-900">{a.team.name}</span>
                      <span className="text-slate-500"> · {a.category.name}</span>
                      {a.dollarAmount > 0 && (
                        <span className="text-slate-500"> · {formatCurrency(a.dollarAmount)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>+{formatPoints(a.pointsAwarded)} pts</span>
                    <span>{formatDate(a.date)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {data.recentActivity.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No activity logged yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LivePulse({ color = "#93c5fd" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full"
        style={{ background: color }}
        animate={{ opacity: [0.6, 0, 0.6], scale: [1, 2.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

function SidebarCard({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.05, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="card p-5 transition-shadow hover:shadow-lg"
    >
      {children}
    </motion.div>
  );
}

function MiniStat({
  label,
  raw,
  format,
}: {
  label: string;
  raw: number;
  format?: (n: number) => string;
}) {
  const animated = useCountUp(raw);
  const display = format ? format(animated) : Math.round(animated).toLocaleString();
  return (
    <motion.div
      whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.08)" }}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center transition-colors sm:text-left"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-white">{display}</p>
    </motion.div>
  );
}

function PodiumCard({
  team,
  highlight,
  index,
}: {
  team: LeaderboardRow;
  highlight: boolean;
  index: number;
}) {
  const points = useCountUp(team.totalPoints);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={clsx(
        "card relative flex items-center gap-4 overflow-hidden p-5 transition-shadow hover:shadow-xl",
        highlight && "ring-2 ring-amber-300"
      )}
      style={{ borderTopColor: team.color, borderTopWidth: 4 }}
    >
      <div className="absolute -right-4 -top-4 text-6xl opacity-10">
        {team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : "🥉"}
      </div>
      <TeamAvatar color={team.color} logo={team.logo} name={team.name} size="lg" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Rank #{team.rank}
        </p>
        <p className="truncate text-lg font-extrabold text-navy-900">{team.name}</p>
        <p className="mt-0.5 text-2xl font-black tabular-nums" style={{ color: team.color }}>
          {formatPoints(points)} <span className="text-sm font-semibold text-slate-400">pts</span>
        </p>
      </div>
    </motion.div>
  );
}
