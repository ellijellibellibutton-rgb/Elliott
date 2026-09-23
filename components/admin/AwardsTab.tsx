"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Award, Team, WinOfWeek } from "@/lib/types";
import { formatDate, formatPoints } from "@/lib/format";
import { Field, TextInput, TextArea, Select, Button, Modal, ConfirmButton, ErrorBanner } from "./ui";

type AwardForm = Omit<Award, "id" | "isDemo" | "order">;
const EMPTY_AWARD: AwardForm = { name: "", description: "", icon: "🏅" };

type WinForm = {
  awardId: string;
  winnerName: string;
  teamId: string;
  date: string;
  description: string;
  bonusPoints: number;
  prize: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
const EMPTY_WIN: WinForm = {
  awardId: "",
  winnerName: "",
  teamId: "",
  date: today(),
  description: "",
  bonusPoints: 5,
  prize: "",
};

export default function AwardsTab() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [wins, setWins] = useState<WinOfWeek[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showAddAward, setShowAddAward] = useState(false);
  const [awardForm, setAwardForm] = useState<AwardForm>(EMPTY_AWARD);
  const [editingAward, setEditingAward] = useState<Award | null>(null);

  const [showAddWin, setShowAddWin] = useState(false);
  const [winForm, setWinForm] = useState<WinForm>(EMPTY_WIN);

  function load() {
    fetch("/api/awards").then((r) => r.json()).then(setAwards);
    fetch("/api/win-of-week").then((r) => r.json()).then(setWins);
    fetch("/api/teams").then((r) => r.json()).then(setTeams);
  }
  useEffect(load, []);

  async function addAward() {
    setError(null);
    try {
      await adminFetch("/api/awards", { method: "POST", body: JSON.stringify(awardForm) });
      setAwardForm(EMPTY_AWARD);
      setShowAddAward(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add award.");
    }
  }

  async function saveAwardEdit() {
    if (!editingAward) return;
    setError(null);
    try {
      await adminFetch(`/api/awards/${editingAward.id}`, { method: "PUT", body: JSON.stringify(editingAward) });
      setEditingAward(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update award.");
    }
  }

  async function removeAward(a: Award) {
    setError(null);
    try {
      await adminFetch(`/api/awards/${a.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete award.");
    }
  }

  async function addWin() {
    setError(null);
    if (!winForm.awardId || !winForm.winnerName) {
      setError("Award and winner name are required.");
      return;
    }
    try {
      await adminFetch("/api/win-of-week", {
        method: "POST",
        body: JSON.stringify({ ...winForm, teamId: winForm.teamId || null }),
      });
      setWinForm(EMPTY_WIN);
      setShowAddWin(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add Win of the Week.");
    }
  }

  async function removeWin(w: WinOfWeek) {
    setError(null);
    try {
      await adminFetch(`/api/win-of-week/${w.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete Win of the Week entry.");
    }
  }

  return (
    <div className="space-y-10">
      <ErrorBanner message={error} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Award Categories</h3>
          <Button onClick={() => setShowAddAward(true)}>+ Add Award</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((a) => (
            <div key={a.id} className="card flex items-start gap-3 p-4">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-navy-900">{a.name}</p>
                <p className="text-sm text-slate-600">{a.description}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button variant="ghost" onClick={() => setEditingAward(a)}>
                  Edit
                </Button>
                <ConfirmButton onConfirm={() => removeAward(a)}>Delete</ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Win of the Week</h3>
          <Button onClick={() => setShowAddWin(true)}>+ Add Win of the Week</Button>
        </div>
        <div className="card overflow-hidden">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Award</th>
                  <th className="px-3 py-3">Winner</th>
                  <th className="px-3 py-3">Team</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3 text-right">Bonus</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {wins.map((w) => (
                  <tr key={w.id} className="border-b border-[var(--border-subtle)] last:border-0">
                    <td className="px-5 py-2.5 font-medium text-navy-900">
                      {w.award.icon} {w.award.name}
                    </td>
                    <td className="px-3 py-2.5">{w.winnerName}</td>
                    <td className="px-3 py-2.5 text-slate-500">{w.team?.name ?? "—"}</td>
                    <td className="px-3 py-2.5 text-slate-500">{formatDate(w.date)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-amber-600">
                      +{formatPoints(w.bonusPoints)}
                    </td>
                    <td className="px-3 py-2.5">
                      <ConfirmButton onConfirm={() => removeWin(w)} className="px-2 py-1 text-xs">
                        Delete
                      </ConfirmButton>
                    </td>
                  </tr>
                ))}
                {wins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No Win of the Week entries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Modal open={showAddAward} onClose={() => setShowAddAward(false)} onSubmit={addAward} title="Add Award">
        <div className="space-y-4">
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <Field label="Icon">
              <TextInput value={awardForm.icon} onChange={(e) => setAwardForm({ ...awardForm, icon: e.target.value })} />
            </Field>
            <Field label="Name">
              <TextInput value={awardForm.name} onChange={(e) => setAwardForm({ ...awardForm, name: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <TextArea
              value={awardForm.description}
              onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
            />
          </Field>
          <Button type="submit" className="w-full">
            Add Award
          </Button>
        </div>
      </Modal>

      <Modal open={!!editingAward} onClose={() => setEditingAward(null)} onSubmit={saveAwardEdit} title="Edit Award">
        {editingAward && (
          <div className="space-y-4">
            <div className="grid grid-cols-[80px_1fr] gap-4">
              <Field label="Icon">
                <TextInput
                  value={editingAward.icon}
                  onChange={(e) => setEditingAward({ ...editingAward, icon: e.target.value })}
                />
              </Field>
              <Field label="Name">
                <TextInput
                  value={editingAward.name}
                  onChange={(e) => setEditingAward({ ...editingAward, name: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Description">
              <TextArea
                value={editingAward.description}
                onChange={(e) => setEditingAward({ ...editingAward, description: e.target.value })}
              />
            </Field>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={showAddWin} onClose={() => setShowAddWin(false)} onSubmit={addWin} title="Add Win of the Week" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Award">
              <Select value={winForm.awardId} onChange={(e) => setWinForm({ ...winForm, awardId: e.target.value })}>
                <option value="">Select award…</option>
                {awards.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Team">
              <Select value={winForm.teamId} onChange={(e) => setWinForm({ ...winForm, teamId: e.target.value })}>
                <option value="">No team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Winner Name">
            <TextInput
              value={winForm.winnerName}
              onChange={(e) => setWinForm({ ...winForm, winnerName: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <TextArea
              value={winForm.description}
              onChange={(e) => setWinForm({ ...winForm, description: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Date">
              <TextInput
                type="date"
                value={winForm.date}
                onChange={(e) => setWinForm({ ...winForm, date: e.target.value })}
              />
            </Field>
            <Field label="Bonus Points">
              <TextInput
                type="number"
                value={winForm.bonusPoints}
                onChange={(e) => setWinForm({ ...winForm, bonusPoints: Number(e.target.value) })}
              />
            </Field>
            <Field label="Prize / Perk">
              <TextInput value={winForm.prize} onChange={(e) => setWinForm({ ...winForm, prize: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" className="w-full">
            Add Win of the Week
          </Button>
        </div>
      </Modal>
    </div>
  );
}
