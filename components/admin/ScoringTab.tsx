"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { ScoringCategory } from "@/lib/types";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Toggle,
  Button,
  Modal,
  ConfirmButton,
  ErrorBanner,
} from "./ui";

const EMPTY: Omit<ScoringCategory, "id" | "isDemo" | "order"> = {
  name: "",
  description: "",
  type: "FIXED",
  statKind: "BONUS",
  pointValue: 0,
  pointsPer100: 0,
  enabled: true,
};

export default function ScoringTab() {
  const [categories, setCategories] = useState<ScoringCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<ScoringCategory | null>(null);

  function load() {
    fetch("/api/scoring")
      .then((r) => r.json())
      .then(setCategories);
  }
  useEffect(load, []);

  async function addCategory() {
    setError(null);
    try {
      await adminFetch("/api/scoring", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY);
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add category.");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      await adminFetch(`/api/scoring/${editing.id}`, { method: "PUT", body: JSON.stringify(editing) });
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category.");
    }
  }

  async function toggleEnabled(c: ScoringCategory) {
    setError(null);
    try {
      await adminFetch(`/api/scoring/${c.id}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: !c.enabled }),
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category.");
    }
  }

  async function remove(c: ScoringCategory) {
    setError(null);
    try {
      await adminFetch(`/api/scoring/${c.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete category.");
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const next = [...categories];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setCategories(next);
    setError(null);
    try {
      await adminFetch("/api/scoring/reorder", {
        method: "POST",
        body: JSON.stringify({ orderedIds: next.map((c) => c.id) }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reorder categories.");
      load();
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {categories.length} categories · Dollars Raised default is {categories.find((c) => c.statKind === "DOLLARS")?.pointsPer100 ?? 3} pts per $100
        </p>
        <Button onClick={() => setShowAdd(true)}>+ Add Scoring Category</Button>
      </div>
      <ErrorBanner message={error} />

      <div className="card mt-4 divide-y divide-[var(--border-subtle)] overflow-hidden">
        {categories.map((c, idx) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="text-xs text-slate-400 hover:text-navy-900 disabled:opacity-20"
              >
                ▲
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === categories.length - 1}
                className="text-xs text-slate-400 hover:text-navy-900 disabled:opacity-20"
              >
                ▼
              </button>
            </div>

            <div className="min-w-[200px] flex-1">
              <p className="font-semibold text-navy-900">
                {c.name} {!c.enabled && <span className="text-xs text-slate-400">(disabled)</span>}
              </p>
              <p className="text-xs text-slate-500">{c.description}</p>
            </div>

            <div className="text-sm font-bold text-blue-600">
              {c.type === "DOLLAR" ? `${c.pointsPer100} pts / $100` : `${c.pointValue} pts`}
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              {c.statKind.replaceAll("_", " ")}
            </span>

            <Toggle checked={c.enabled} onChange={() => toggleEnabled(c)} />

            <div className="flex gap-1.5">
              <Button variant="ghost" onClick={() => setEditing(c)}>
                Edit
              </Button>
              <ConfirmButton onConfirm={() => remove(c)}>Delete</ConfirmButton>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No scoring categories yet.</p>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addCategory} title="Add Scoring Category" wide>
        <ScoringForm value={form} onChange={setForm} submitLabel="Add Category" />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} onSubmit={saveEdit} title="Edit Scoring Category" wide>
        {editing && (
          <ScoringForm
            value={editing}
            onChange={(v) => setEditing({ ...editing, ...v })}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}

function ScoringForm({
  value,
  onChange,
  submitLabel,
}: {
  value: Omit<ScoringCategory, "id" | "isDemo" | "order">;
  onChange: (v: typeof value) => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <Field label="Name">
        <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </Field>
      <Field label="Description">
        <TextArea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category Type">
          <Select
            value={value.type}
            onChange={(e) => onChange({ ...value, type: e.target.value as "FIXED" | "DOLLAR" })}
          >
            <option value="FIXED">Fixed points per activity</option>
            <option value="DOLLAR">Points per $100 raised</option>
          </Select>
        </Field>
        <Field label="Stat Bucket" hint="Which leaderboard column this feeds">
          <Select
            value={value.statKind}
            onChange={(e) => onChange({ ...value, statKind: e.target.value as ScoringCategory["statKind"] })}
          >
            <option value="DOLLARS">Dollars Raised</option>
            <option value="BUSINESS_CONTACTED">Businesses Contacted</option>
            <option value="MEETING">Meetings / Follow-Ups</option>
            <option value="PITCH">Pitches</option>
            <option value="BONUS">Bonus</option>
          </Select>
        </Field>
      </div>
      {value.type === "DOLLAR" ? (
        <Field label="Points per $100 raised">
          <TextInput
            type="number"
            step="0.1"
            value={value.pointsPer100}
            onChange={(e) => onChange({ ...value, pointsPer100: Number(e.target.value) })}
          />
        </Field>
      ) : (
        <Field label="Point Value">
          <TextInput
            type="number"
            step="0.1"
            value={value.pointValue}
            onChange={(e) => onChange({ ...value, pointValue: Number(e.target.value) })}
          />
        </Field>
      )}
      <Toggle
        checked={value.enabled}
        onChange={(v) => onChange({ ...value, enabled: v })}
        label="Enabled"
      />
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
