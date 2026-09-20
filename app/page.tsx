"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useLivePolling } from "@/hooks/useLivePolling";
import type { DashboardData, LeaderboardRow } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime, formatPoints } from "@/lib/format";
import TeamAvatar from "@/components/TeamAvatar";
import RankBadge from "@/components/RankBadge";
import MovementBadge from "@/components/MovementBadge";

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

  return (
    <div className="bg-[var(--background)]">
      {/* Hero */}
      <section className="border-b border-[var(--border-subtle)] bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                {data.settings.committeeName}
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {data.settings.campaignName}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
                {data.settings.campaignDescription}
              </p>
            </div>
            {data.currentSprint && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
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
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <MiniStat label="Total Points" value={formatPoints(data.totals.totalPoints)} />
            <MiniStat label="Dollars Raised" value={formatCurrency(data.totals.totalDollars)} />
            <MiniStat label="Businesses" value={data.totals.businessesContacted} />
            <MiniStat label="Meetings" value={data.totals.meetings} />
            <MiniStat label="Pitches" value={data.totals.pitches} />
            <MiniStat label="Teams" value={data.totals.activeTeams} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Top 3 podium */}
        <div className="grid gap-4 sm:grid-cols-3">
          {top3.map((team, idx) => (
            <PodiumCard key={team.teamId} team={team} highlight={idx === 0} />
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Leaderboard table */}
          <div className="card overflow-hidden lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="text-lg font-bold text-navy-900">Full Leaderboard</h2>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams…"
                className="w-48 rounded-full border border-[var(--border-subtle)] px-3.5 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
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
                        className="cursor-pointer select-none px-3 py-3 text-right font-semibold hover:text-navy-900"
                        onClick={() => toggleSort(key)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {SORT_LABELS[key]}
                          {sortKey === key && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-right font-semibold">Move</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((team) => (
                    <tr
                      key={team.teamId}
                      className={clsx(
                        "border-b border-[var(--border-subtle)] last:border-0 hover:bg-slate-50",
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
                    </tr>
                  ))}
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
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {data.latestWin && (
              <div className="card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  🏅 Win of the Week
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
              </div>
            )}

            {biggestMover && (
              <div className="card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  📈 Biggest Mover
                </h3>
                <div className="mt-2 flex items-center gap-3">
                  <TeamAvatar color={biggestMover.color} logo={biggestMover.logo} name={biggestMover.name} />
                  <div>
                    <p className="font-bold text-navy-900">{biggestMover.name}</p>
                    <MovementBadge movement={biggestMover.movement} />
                  </div>
                </div>
              </div>
            )}

            {data.nextMeeting && (
              <div className="card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  📅 Next Meeting
                </h3>
                <p className="mt-2 font-bold text-navy-900">{data.nextMeeting.title}</p>
                <p className="text-xs text-slate-500">{formatDateTime(data.nextMeeting.date)}</p>
                {data.nextMeeting.sprintChallenge && (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold">Sprint challenge: </span>
                    {data.nextMeeting.sprintChallenge}
                  </p>
                )}
              </div>
            )}

            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                💰 Current Scoring
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
            </div>

            {data.prizes.length > 0 && (
              <div className="card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  🎁 Current Prizes
                </h3>
                <ul className="mt-2 space-y-2">
                  {data.prizes.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      <span>{p.icon}</span>
                      <span className="text-slate-700">{p.name}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/prizes-awards" className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:underline">
                  View all prizes →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="mt-10 card p-5">
          <h2 className="text-lg font-bold text-navy-900">Recent Activity</h2>
          <div className="mt-3 divide-y divide-[var(--border-subtle)]">
            {data.recentActivity.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
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
              </div>
            ))}
            {data.recentActivity.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No activity logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center sm:text-left">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}

function PodiumCard({ team, highlight }: { team: LeaderboardRow; highlight: boolean }) {
  return (
    <div
      className={clsx(
        "card relative flex items-center gap-4 overflow-hidden p-5",
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
          {formatPoints(team.totalPoints)} <span className="text-sm font-semibold text-slate-400">pts</span>
        </p>
      </div>
    </div>
  );
}
