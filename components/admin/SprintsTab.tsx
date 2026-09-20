"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Sprint } from "@/lib/types";
import { formatDate } from "@/lib/format";
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

function toDateInput(v: string) {
  return v ? new Date(v).toISOString().slice(0, 10) : "";
}

type FormState = Omit<Sprint, "id" | "order">;

const EMPTY: FormState = {
  name: "",
  description: "",
  startDate: today(),
  endDate: today(),
  status: "UPCOMING",
  bonusOpportunities: "",
};

function today() {
  return new Date().toISOString();
}

export default function SprintsTab() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState<Sprint | null>(null);

  function load() {
    fetch("/api/sprints").then((r) => r.json()).then(setSprints);
  }
  useEffect(load, []);

  async function add() {
    setError(null);
    try {
      await adminFetch("/api/sprints", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY);
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add sprint.");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      await adminFetch(`/api/sprints/${editing.id}`, { method: "PUT", body: JSON.stringify(editing) });
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update sprint.");
    }
  }

  async function remove(s: Sprint) {
    await adminFetch(`/api/sprints/${s.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{sprints.length} sprints</p>
        <Button onClick={() => setShowAdd(true)}>+ Add Sprint</Button>
      </div>
      <ErrorBanner message={error} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {sprints.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-navy-900">{s.name}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(s.startDate)} – {formatDate(s.endDate)}
                </p>
              </div>
              <StatusPill status={s.status} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{s.description}</p>
            {s.bonusOpportunities && (
              <p className="mt-2 text-xs text-amber-600">🎁 {s.bonusOpportunities}</p>
            )}
            <div className="mt-3 flex gap-2 border-t border-[var(--border-subtle)] pt-3">
              <Button variant="ghost" onClick={() => setEditing(s)}>
                Edit
              </Button>
              <ConfirmButton onConfirm={() => remove(s)}>Delete</ConfirmButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Sprint" wide>
        <SprintForm value={form} onChange={setForm} onSubmit={add} submitLabel="Add Sprint" />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Sprint" wide>
        {editing && (
          <SprintForm
            value={editing}
            onChange={(v) => setEditing({ ...editing, ...v })}
            onSubmit={saveEdit}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}

function StatusPill({ status }: { status: Sprint["status"] }) {
  const map = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    UPCOMING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function SprintForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
}: {
  value: FormState;
  onChange: (v: FormState) => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <Field label="Sprint Name">
        <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </Field>
      <Field label="Description">
        <TextArea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Date">
          <TextInput
            type="date"
            value={toDateInput(value.startDate)}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          />
        </Field>
        <Field label="End Date">
          <TextInput
            type="date"
            value={toDateInput(value.endDate)}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Status">
        <Select
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value as Sprint["status"] })}
        >
          <option value="UPCOMING">Upcoming</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </Field>
      <Field label="Bonus Opportunities">
        <TextArea
          value={value.bonusOpportunities}
          onChange={(e) => onChange({ ...value, bonusOpportunities: e.target.value })}
        />
      </Field>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
