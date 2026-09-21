import { prisma } from "@/lib/prisma";
import { formatDate, formatPoints } from "@/lib/format";
import { Gift, Medal, Trophy, Target, Star, Package, type LucideIcon } from "lucide-react";
import TeamAvatar from "@/components/TeamAvatar";
import IconBadge from "@/components/IconBadge";
import FadeIn from "@/components/motion/FadeIn";
import HoverLift from "@/components/motion/HoverLift";

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
    <div>
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 py-14 text-center text-white">
        <div
          className="blob-1 absolute -right-20 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #a83d3d, transparent 70%)" }}
        />
        <div
          className="blob-2 absolute -left-16 bottom-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #eda100, transparent 70%)" }}
        />
        <FadeIn className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Gift size={28} strokeWidth={2.25} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Prizes &amp; Awards</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            What you&apos;re competing for — plus the Win of the Week awards handed out every meeting.
          </p>
        </FadeIn>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Prizes */}
        <section>
          <SectionHeading icon={Gift} color="#a83d3d" title="Prizes" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prizes.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.05}>
                <HoverLift className="card flex h-full flex-col p-5">
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
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    {p.eligibility && (
                      <p className="flex items-center gap-1.5">
                        <Target size={13} className="text-slate-400" /> {p.eligibility}
                      </p>
                    )}
                    {p.requiredRank && (
                      <p className="flex items-center gap-1.5">
                        <Trophy size={13} className="text-slate-400" /> Requires rank #{p.requiredRank} or better
                      </p>
                    )}
                    {p.requiredPoints && (
                      <p className="flex items-center gap-1.5">
                        <Star size={13} className="text-slate-400" /> Requires {formatPoints(p.requiredPoints)}+ points
                      </p>
                    )}
                    {p.quantity > 1 && (
                      <p className="flex items-center gap-1.5">
                        <Package size={13} className="text-slate-400" /> Quantity: {p.quantity}
                      </p>
                    )}
                  </div>
                </HoverLift>
              </FadeIn>
            ))}
            {prizes.length === 0 && <p className="text-sm text-slate-400">No prizes added yet.</p>}
          </div>
        </section>

        {/* Award categories */}
        <section className="mt-12">
          <SectionHeading icon={Medal} color="#eda100" title="Win of the Week Awards" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((a, i) => (
              <FadeIn key={a.id} delay={i * 0.05}>
                <HoverLift className="card flex items-center gap-3 p-5">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <p className="font-bold text-navy-900">{a.name}</p>
                    <p className="text-sm text-slate-600">{a.description}</p>
                  </div>
                </HoverLift>
              </FadeIn>
            ))}
            {awards.length === 0 && <p className="text-sm text-slate-400">No awards added yet.</p>}
          </div>
        </section>

        {/* Recent winners */}
        <section className="mt-12 mb-16">
          <SectionHeading icon={Trophy} color="#2a5ca8" title="Recent Winners" />
          <FadeIn delay={0.1}>
            <div className="card mt-4 divide-y divide-[var(--border-subtle)]">
              {recentWins.map((w) => (
                <div
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                >
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
          </FadeIn>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  color,
  title,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-bold text-navy-900">
      <IconBadge icon={Icon} color={color} solid />
      {title}
    </h2>
  );
}
