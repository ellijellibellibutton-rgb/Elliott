import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Scale, Users, ShieldCheck, Gavel, Coins, type LucideIcon } from "lucide-react";
import IconBadge from "@/components/IconBadge";
import FadeIn from "@/components/motion/FadeIn";
import HoverLift from "@/components/motion/HoverLift";

export const dynamic = "force-dynamic";

export default async function JudgesRulesPage() {
  const [judges, rules, categories] = await Promise.all([
    prisma.judge.findMany({ orderBy: { order: "asc" } }),
    prisma.rule.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] }),
    prisma.scoringCategory.findMany({ where: { enabled: true }, orderBy: { order: "asc" } }),
  ]);

  const verificationRules = rules.filter((r) => r.section === "VERIFICATION");
  const competitionRules = rules.filter((r) => r.section === "COMPETITION");

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 py-14 text-center text-white">
        <div
          className="blob-1 absolute -left-20 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3987e5, transparent 70%)" }}
        />
        <div
          className="blob-2 absolute -right-16 bottom-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #6d5ce7, transparent 70%)" }}
        />
        <FadeIn className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Scale size={28} strokeWidth={2.25} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Judges &amp; Rules</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            How scoring works, how activity is verified, and who&apos;s keeping the competition fair.
          </p>
        </FadeIn>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Judges */}
        <section>
          <SectionHeading icon={Users} color="#2a78d6" title="Current Judges" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {judges.map((j, i) => (
              <FadeIn key={j.id} delay={i * 0.05}>
                <HoverLift className="card p-5">
                  <div className="flex items-start gap-3">
                    <IconBadge icon={Users} color="#2a78d6" />
                    <div>
                      <p className="text-lg font-bold text-navy-900">{j.name}</p>
                      <p className="text-sm font-semibold text-blue-600">{j.role}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{j.responsibilities}</p>
                </HoverLift>
              </FadeIn>
            ))}
            {judges.length === 0 && (
              <p className="text-sm text-slate-400">No judges added yet.</p>
            )}
          </div>
        </section>

        {/* Scoring rules */}
        <section className="mt-12">
          <SectionHeading icon={Coins} color="#1baf7a" title="Scoring Rules" />
          <FadeIn delay={0.05}>
            <div className="card mt-4 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Category</th>
                    <th className="px-3 py-3">Description</th>
                    <th className="px-3 py-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-[var(--border-subtle)] transition-colors last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 font-semibold text-navy-900">{c.name}</td>
                      <td className="px-3 py-3 text-slate-600">{c.description}</td>
                      <td className="px-3 py-3 text-right font-bold text-blue-600">
                        {c.type === "DOLLAR" ? `${c.pointsPer100} pts / $100` : `${c.pointValue} pts`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <span className="font-semibold">Dollar conversion example: </span>
              {(() => {
                const dollarCat = categories.find((c) => c.statKind === "DOLLARS");
                const rate = dollarCat?.pointsPer100 ?? 3;
                return (
                  <>
                    {formatCurrency(100)} raised = {rate} pts · {formatCurrency(500)} raised = {rate * 5} pts ·{" "}
                    {formatCurrency(1000)} raised = {rate * 10} pts
                  </>
                );
              })()}
            </div>
          </FadeIn>
        </section>

        {/* Verification rules */}
        <section className="mt-12">
          <SectionHeading icon={ShieldCheck} color="#eda100" title="Verification Rules" />
          <div className="mt-4 grid gap-3">
            {verificationRules.map((r, i) => (
              <FadeIn key={r.id} delay={i * 0.04}>
                <HoverLift className="card p-5">
                  <p className="font-semibold text-navy-900">{r.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{r.content}</p>
                </HoverLift>
              </FadeIn>
            ))}
            {verificationRules.length === 0 && (
              <p className="text-sm text-slate-400">No verification rules added yet.</p>
            )}
          </div>
        </section>

        {/* Competition rules */}
        <section className="mt-12 mb-16">
          <SectionHeading icon={Gavel} color="#e34948" title="Competition Rules" />
          <div className="mt-4 grid gap-3">
            {competitionRules.map((r, i) => (
              <FadeIn key={r.id} delay={i * 0.04}>
                <HoverLift className="card p-5">
                  <p className="font-semibold text-navy-900">{r.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{r.content}</p>
                </HoverLift>
              </FadeIn>
            ))}
            {competitionRules.length === 0 && (
              <p className="text-sm text-slate-400">No competition rules added yet.</p>
            )}
          </div>
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
