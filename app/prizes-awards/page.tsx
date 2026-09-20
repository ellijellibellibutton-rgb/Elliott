import { prisma } from "@/lib/prisma";
import { formatDate, formatPoints } from "@/lib/format";
import TeamAvatar from "@/components/TeamAvatar";

export const dynamic = "force-dynamic";

export default async function PrizesAwardsPage() {
  const [prizes, awards, recentWins] = await Promise.all([
    prisma.prize.findMany({ orderBy: { order: "asc" } }),
    prisma.award.findMany({ orderBy: { order: "asc" } }),
    prisma.winOfWeek.findMany({
      orderBy: { date: "desc" },
      take: 12,
      include: { award: true, team: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          🎁 Prizes &amp; Awards
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
          What you&apos;re competing for — plus the Win of the Week awards handed out every meeting.
        </p>
      </header>

      {/* Prizes */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-navy-900">Prizes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prizes.map((p) => (
            <div key={p.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{p.icon}</span>
                {p.claimed ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                    Claimed
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                    Available
                  </span>
                )}
              </div>
              <p className="mt-3 text-lg font-bold text-navy-900">{p.name}</p>
              <p className="mt-1 flex-1 text-sm text-slate-600">{p.description}</p>
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                {p.eligibility && <p>🎯 {p.eligibility}</p>}
                {p.requiredRank && <p>🏆 Requires rank #{p.requiredRank} or better</p>}
                {p.requiredPoints && <p>⭐ Requires {formatPoints(p.requiredPoints)}+ points</p>}
                {p.quantity > 1 && <p>📦 Quantity: {p.quantity}</p>}
              </div>
            </div>
          ))}
          {prizes.length === 0 && <p className="text-sm text-slate-400">No prizes added yet.</p>}
        </div>
      </section>

      {/* Award categories */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-navy-900">Win of the Week Awards</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((a) => (
            <div key={a.id} className="card flex items-center gap-3 p-5">
              <span className="text-3xl">{a.icon}</span>
              <div>
                <p className="font-bold text-navy-900">{a.name}</p>
                <p className="text-sm text-slate-600">{a.description}</p>
              </div>
            </div>
          ))}
          {awards.length === 0 && <p className="text-sm text-slate-400">No awards added yet.</p>}
        </div>
      </section>

      {/* Recent winners */}
      <section className="mt-12 mb-16">
        <h2 className="text-xl font-bold text-navy-900">Recent Winners</h2>
        <div className="card mt-4 divide-y divide-[var(--border-subtle)]">
          {recentWins.map((w) => (
            <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.award.icon}</span>
                <div>
                  <p className="font-semibold text-navy-900">
                    {w.award.name} — {w.winnerName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    {w.team && (
                      <>
                        <TeamAvatar color={w.team.color} logo={w.team.logo} name={w.team.name} size="sm" />
                        {w.team.name}
                      </>
                    )}
                    <span>· {formatDate(w.date)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">
                  +{formatPoints(w.bonusPoints)} pts
                </span>
                {w.prize && <span className="text-slate-500">{w.prize}</span>}
              </div>
            </div>
          ))}
          {recentWins.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No winners yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
