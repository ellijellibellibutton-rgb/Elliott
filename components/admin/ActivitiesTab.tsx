"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Activity, ScoringCategory, Sprint, Team } from "@/lib/types";
import { formatCurrency, formatDate, formatPoints } from "@/lib/format";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Button,
  Modal,
  ConfirmButton,
  ErrorBanner,
} from "./ui";

type FormState = {
  teamId: string;
  studentId: string;
  categoryId: string;
  sprintId: string;
  date: string;
  quantity: number;
  dollarAmount: number;
  notes: string;
  evidence: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM: FormState = {
  teamId: "",
  studentId: "",
  categoryId: "",
  sprintId: "",
  date: today(),
  quantity: 1,
  dollarAmount: 0,
  notes: "",
  evidence: "",
  approvalStatus: "APPROVED",
};

export default function ActivitiesTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<ScoringCategory[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function load() {
    adminFetch<Activity[]>("/api/activities").then(setActivities);
  }
  useEffect(() => {
    load();
    fetch("/api/teams").then((r) => r.json()).then(setTeams);
    fetch("/api/scoring").then((r) => r.json()).then(setCategories);
    fetch("/api/sprints").then((r) => r.json()).then(setSprints);
  }, []);

  const roster = useMemo(
    () => teams.find((t) => t.id === form.teamId)?.students ?? [],
    [teams, form.teamId]
  );
  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const previewPoints = selectedCategory
    ? selectedCategory.type === "DOLLAR"
      ? (form.dollarAmount / 100) * selectedCategory.pointsPer100
      : selectedCategory.pointValue * (form.quantity || 1)
    : 0;

  async function addActivity() {
    setError(null);
    if (!form.teamId || !form.categoryId) {
      setError("Team and category are required.");
      return;
    }
    try {
      await adminFetch("/api/activities", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          studentId: form.studentId || null,
          sprintId: form.sprintId || null,
        }),
      });
      setForm(EMPTY_FORM);
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to log activity.");
    }
  }

  async function setApproval(a: Activity, status: Activity["approvalStatus"]) {
    setError(null);
    try {
      await adminFetch(`/api/activities/${a.id}`, {
        method: "PUT",
        body: JSON.stringify({ approvalStatus: status }),
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update activity.");
    }
  }

  async function remove(a: Activity) {
    setError(null);
    try {
      await adminFetch(`/api/activities/${a.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete activity.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{activities.length} logged activities (most recent 300)</p>
        <Button onClick={() => setShowAdd(true)}>+ Log Activity</Button>
      </div>
      <ErrorBanner message={error} />

      <div className="card mt-4 overflow-hidden">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Date</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3 text-right">Qty / $</th>
                <th className="px-3 py-3 text-right">Points</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} className="border-b border-[var(--border-subtle)] last:border-0">
                  <td className="px-5 py-2.5 text-slate-500">{formatDate(a.date)}</td>
                  <td className="px-3 py-2.5 font-medium text-navy-900">{a.team.name}</td>
                  <td className="px-3 py-2.5 text-slate-500">{a.student?.name ?? "—"}</td>
                  <td className="px-3 py-2.5">{a.category.name}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {a.dollarAmount > 0 ? formatCurrency(a.dollarAmount) : a.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-blue-600">
                    {formatPoints(a.pointsAwarded)}
                  </td>
                  <td className="px-3 py-2.5">
                    <Select
                      value={a.approvalStatus}
                      onChange={(e) => setApproval(a, e.target.value as Activity["approvalStatus"])}
                      className="w-32 py-1 text-xs"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </Select>
                  </td>
                  <td className="px-3 py-2.5">
                    <ConfirmButton onConfirm={() => remove(a)} className="px-2 py-1 text-xs">
                      Delete
                    </ConfirmButton>
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    No activities logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addActivity} title="Log Activity" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Team">
              <Select
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value, studentId: "" })}
              >
                <option value="">Select team…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Student (optional)">
              <Select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                <option value="">Whole team</option>
                {roster.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select category…</option>
                {categories
                  .filter((c) => c.enabled)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Sprint (optional)">
              <Select value={form.sprintId} onChange={(e) => setForm({ ...form, sprintId: e.target.value })}>
                <option value="">Auto-detect from date</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <TextInput
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            {selectedCategory?.type === "DOLLAR" ? (
              <Field label="Dollar Amount">
                <TextInput
                  type="number"
                  min={0}
                  value={form.dollarAmount}
                  onChange={(e) => setForm({ ...form, dollarAmount: Number(e.target.value) })}
                />
              </Field>
            ) : (
              <Field label="Quantity">
                <TextInput
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />
              </Field>
            )}
          </div>

          <Field label="Notes">
            <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <Field label="Evidence" hint="Link, description, or reference to proof">
            <TextInput value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} />
          </Field>
          <Field label="Approval Status">
            <Select
              value={form.approvalStatus}
              onChange={(e) => setForm({ ...form, approvalStatus: e.target.value as FormState["approvalStatus"] })}
            >
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </Field>

          {selectedCategory && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              This will award <span className="font-bold">{formatPoints(previewPoints)} points</span>.
            </div>
          )}

          <Button type="submit" className="w-full">
            Log Activity
          </Button>
        </div>
      </Modal>
    </div>
  );
}
