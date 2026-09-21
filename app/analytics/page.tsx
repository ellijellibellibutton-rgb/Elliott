"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  Trophy,
  DollarSign,
  Building2,
  Handshake,
  Mic,
  Users,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { useLivePolling } from "@/hooks/useLivePolling";
import type { AnalyticsData, Sprint, ScoringCategory, LeaderboardRow } from "@/lib/types";
import { formatCurrency, formatDate, formatPoints } from "@/lib/format";
import StatCard from "@/components/ui/StatCard";
import TeamAvatar from "@/components/TeamAvatar";
import MovementBadge from "@/components/MovementBadge";
import IconBadge from "@/components/IconBadge";

type Filters = { teamId: string; sprintId: string; categoryId: string };

const cardIn = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<Filters>({ teamId: "", sprintId: "", categoryId: "" });
  const [teams, setTeams] = useState<LeaderboardRow[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [categories, setCategories] = useState<ScoringCategory[]>([]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.teamId) params.set("teamId", filters.teamId);
    if (filters.sprintId) params.set("sprintId", filters.sprintId);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    const qs = params.toString();
    return qs ? `/api/analytics?${qs}` : "/api/analytics";
  }, [filters]);

  const { data, loading, error } = useLivePolling<AnalyticsData>(query, 20000);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setTeams(d.leaderboard ?? []));
    fetch("/api/sprints")
      .then((r) => r.json())
      .then(setSprints);
    fetch("/api/scoring")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  if (loading && !data) {
    return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-slate-400">Loading analytics…</div>;
  }
  if (error && !data) {
    return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-red-600">{error}</div>;
  }
  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
            <IconBadge icon={BarChart3} color="#4a3aa7" size="lg" solid />
            Competition Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live performance across every team, sprint, and scoring category.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect
            label="All Teams"
            value={filters.teamId}
            onChange={(v) => setFilters((f) => ({ ...f, teamId: v }))}
            options={teams.map((t) => ({ value: t.teamId, label: t.name }))}
          />
          <FilterSelect
            label="All Sprints"
            value={filters.sprintId}
            onChange={(v) => setFilters((f) => ({ ...f, sprintId: v }))}
            options={sprints.map((s) => ({ value: s.id, label: s.name }))}
          />
          <FilterSelect
            label="All Categories"
            value={filters.categoryId}
            onChange={(v) => setFilters((f) => ({ ...f, categoryId: v }))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {[
          { label: "Total Points", value: formatPoints(data.totals.totalPoints), icon: Trophy, accent: "#2a78d6" },
          { label: "$ Raised", value: formatCurrency(data.totals.totalDollars), icon: DollarSign, accent: "#1baf7a" },
          { label: "Businesses", value: data.totals.businessesContacted, icon: Building2, accent: "#eb6834" },
          { label: "Meetings", value: data.totals.meetings, icon: Handshake, accent: "#eda100" },
          { label: "Pitches", value: data.totals.pitches, icon: Mic, accent: "#e87ba4" },
          { label: "Active Teams", value: data.totals.activeTeams, icon: Users, accent: "#4a3aa7" },
          { label: "Active Students", value: data.totals.activeStudents, icon: GraduationCap, accent: "#e34948" },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i} initial="hidden" animate="show" variants={cardIn}>
            <StatCard
              label={s.label}
              value={s.value}
              icon={<s.icon size={16} strokeWidth={2.25} />}
              accent={s.accent}
              className="transition-shadow hover:shadow-lg"
            />
          </motion.div>
        ))}
      </div>

      {/* Weekly charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Points by Week" index={0}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.weeklyPerformance} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} />
              <YAxis tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e7ee", fontSize: 12 }} />
              <Line type="monotone" dataKey="points" name="Points" stroke="#2a78d6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Dollars Raised by Week" index={1}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.weeklyPerformance} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} />
              <YAxis tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={false} width={48} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e4e7ee", fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Bar dataKey="dollars" name="Dollars" fill="#1baf7a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Outreach Activity by Week" index={2} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.weeklyPerformance} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} />
              <YAxis tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e7ee", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="businesses" name="Businesses" stroke="#2a78d6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="meetings" name="Meetings" stroke="#eb6834" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="pitches" name="Pitches" stroke="#1baf7a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Category breakdown + Sprint performance */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Points by Category" index={3}>
          <ResponsiveContainer width="100%" height={Math.max(220, data.categoryPerformance.length * 40)}>
            <BarChart
              layout="vertical"
              data={data.categoryPerformance}
              margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#52514e" }}
                tickLine={false}
                axisLine={false}
                width={150}
              />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e7ee", fontSize: 12 }} />
              <Bar dataKey="points" name="Points" fill="#2a78d6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sprint Performance" index={4}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.sprintPerformance} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} />
              <YAxis tick={{ fontSize: 11, fill: "#898781" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e7ee", fontSize: 12 }} />
              <Bar dataKey="points" name="Points" fill="#4a3aa7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Team performance table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="card mt-8 overflow-hidden"
      >
        <h2 className="border-b border-[var(--border-subtle)] px-5 py-4 text-lg font-bold text-navy-900">
          Team Performance
        </h2>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Rank</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3 text-right">Points</th>
                <th className="px-3 py-3 text-right">$ Raised</th>
                <th className="px-3 py-3 text-right">Businesses</th>
                <th className="px-3 py-3 text-right">Meetings</th>
                <th className="px-3 py-3 text-right">Pitches</th>
                <th className="px-3 py-3 text-right">Bonus</th>
                <th className="px-3 py-3 text-right">Weekly Change</th>
              </tr>
            </thead>
            <tbody>
              {data.teamPerformance.map((t) => (
                <tr
                  key={t.teamId}
                  className="border-b border-[var(--border-subtle)] transition-colors last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-semibold text-slate-500">#{t.rank}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <TeamAvatar color={t.color} logo={t.logo} name={t.name} size="sm" />
                      <span className="font-semibold text-navy-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums">{formatPoints(t.totalPoints)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(t.dollarsRaised)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{t.businessesContacted}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{t.meetings}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{t.pitches}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatPoints(t.bonusPoints)}</td>
                  <td className="px-3 py-3 text-right">
                    <MovementBadge movement={t.movement} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Win of the Week history */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.45 }}
        className="card mt-8 overflow-hidden"
      >
        <h2 className="border-b border-[var(--border-subtle)] px-5 py-4 text-lg font-bold text-navy-900">
          Win of the Week History
        </h2>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Award</th>
                <th className="px-3 py-3">Winner</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3 text-right">Bonus</th>
                <th className="px-3 py-3">Prize</th>
              </tr>
            </thead>
            <tbody>
              {data.winHistory.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-[var(--border-subtle)] transition-colors last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-semibold text-navy-900">
                    {w.award.icon} {w.award.name}
                  </td>
                  <td className="px-3 py-3">{w.winnerName}</td>
                  <td className="px-3 py-3 text-slate-500">{w.team?.name ?? "—"}</td>
                  <td className="px-3 py-3 text-slate-500">{formatDate(w.date)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-amber-600">
                    +{formatPoints(w.bonusPoints)}
                  </td>
                  <td className="px-3 py-3 text-slate-500">{w.prize}</td>
                </tr>
              ))}
              {data.winHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No Win of the Week history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className,
  index = 0,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="show"
      variants={cardIn}
      whileHover={{ y: -2 }}
      className={`card p-5 transition-shadow hover:shadow-lg ${className ?? ""}`}
    >
      <h3 className="mb-2 text-sm font-bold text-navy-900">{title}</h3>
      {children}
    </motion.div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-[var(--border-subtle)] bg-white px-3.5 py-1.5 text-sm text-slate-600 outline-none transition-colors focus:border-blue-400"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
