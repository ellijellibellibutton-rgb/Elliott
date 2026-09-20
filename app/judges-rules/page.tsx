import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          ⚖️ Judges &amp; Rules
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
          How scoring works, how activity is verified, and who&apos;s keeping the competition fair.
        </p>
      </header>

      {/* Judges */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-navy-900">Current Judges</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {judges.map((j) => (
            <div key={j.id} className="card p-5">
              <p className="text-lg font-bold text-navy-900">{j.name}</p>
              <p className="text-sm font-semibold text-blue-600">{j.role}</p>
              <p className="mt-2 text-sm text-slate-600">{j.responsibilities}</p>
            </div>
          ))}
          {judges.length === 0 && (
            <p className="text-sm text-slate-400">No judges added yet.</p>
          )}
        </div>
      </section>

      {/* Scoring rules */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-navy-900">Scoring Rules</h2>
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
                <tr key={c.id} className="border-b border-[var(--border-subtle)] last:border-0">
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
      </section>

      {/* Verification rules */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-navy-900">Verification Rules</h2>
        <div className="mt-4 grid gap-3">
          {verificationRules.map((r) => (
            <div key={r.id} className="card p-5">
              <p className="font-semibold text-navy-900">{r.title}</p>
              <p className="mt-1 text-sm text-slate-600">{r.content}</p>
            </div>
          ))}
          {verificationRules.length === 0 && (
            <p className="text-sm text-slate-400">No verification rules added yet.</p>
          )}
        </div>
      </section>

      {/* Competition rules */}
      <section className="mt-12 mb-16">
        <h2 className="text-xl font-bold text-navy-900">Competition Rules</h2>
        <div className="mt-4 grid gap-3">
          {competitionRules.map((r) => (
            <div key={r.id} className="card p-5">
              <p className="font-semibold text-navy-900">{r.title}</p>
              <p className="mt-1 text-sm text-slate-600">{r.content}</p>
            </div>
          ))}
          {competitionRules.length === 0 && (
            <p className="text-sm text-slate-400">No competition rules added yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
