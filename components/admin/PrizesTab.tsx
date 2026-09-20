"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Prize } from "@/lib/types";
import { Field, TextInput, TextArea, Toggle, Button, Modal, ConfirmButton, ErrorBanner } from "./ui";

type FormState = Omit<Prize, "id" | "isDemo" | "order">;
const EMPTY: FormState = {
  name: "",
  description: "",
  icon: "🎁",
  eligibility: "",
  requiredRank: null,
  requiredPoints: null,
  quantity: 1,
  claimed: false,
};

export default function PrizesTab() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState<Prize | null>(null);

  function load() {
    fetch("/api/prizes").then((r) => r.json()).then(setPrizes);
  }
  useEffect(load, []);

  async function add() {
    setError(null);
    try {
      await adminFetch("/api/prizes", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY);
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add prize.");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      await adminFetch(`/api/prizes/${editing.id}`, { method: "PUT", body: JSON.stringify(editing) });
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update prize.");
    }
  }

  async function toggleClaimed(p: Prize) {
    await adminFetch(`/api/prizes/${p.id}`, { method: "PUT", body: JSON.stringify({ claimed: !p.claimed }) });
    load();
  }

  async function remove(p: Prize) {
    await adminFetch(`/api/prizes/${p.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{prizes.length} prizes</p>
        <Button onClick={() => setShowAdd(true)}>+ Add Prize</Button>
      </div>
      <ErrorBanner message={error} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prizes.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-start justify-between">
              <span className="text-2xl">{p.icon}</span>
              <Toggle checked={p.claimed} onChange={() => toggleClaimed(p)} label="Claimed" />
            </div>
            <p className="mt-2 font-bold text-navy-900">{p.name}</p>
            <p className="text-sm text-slate-600">{p.description}</p>
            <p className="mt-1 text-xs text-slate-400">{p.eligibility}</p>
            <div className="mt-3 flex gap-2 border-t border-[var(--border-subtle)] pt-3">
              <Button variant="ghost" onClick={() => setEditing(p)}>
                Edit
              </Button>
              <ConfirmButton onConfirm={() => remove(p)}>Delete</ConfirmButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Prize" wide>
        <PrizeForm value={form} onChange={setForm} onSubmit={add} submitLabel="Add Prize" />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Prize" wide>
        {editing && (
          <PrizeForm
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

function PrizeForm({
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
      <div className="grid grid-cols-[80px_1fr] gap-4">
        <Field label="Icon">
          <TextInput value={value.icon} onChange={(e) => onChange({ ...value, icon: e.target.value })} />
        </Field>
        <Field label="Name">
          <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </Field>
      <Field label="Eligibility">
        <TextInput
          value={value.eligibility}
          onChange={(e) => onChange({ ...value, eligibility: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Required Rank">
          <TextInput
            type="number"
            value={value.requiredRank ?? ""}
            onChange={(e) => onChange({ ...value, requiredRank: e.target.value ? Number(e.target.value) : null })}
          />
        </Field>
        <Field label="Required Points">
          <TextInput
            type="number"
            value={value.requiredPoints ?? ""}
            onChange={(e) =>
              onChange({ ...value, requiredPoints: e.target.value ? Number(e.target.value) : null })
            }
          />
        </Field>
        <Field label="Quantity">
          <TextInput
            type="number"
            min={1}
            value={value.quantity}
            onChange={(e) => onChange({ ...value, quantity: Number(e.target.value) })}
          />
        </Field>
      </div>
      <Toggle
        checked={value.claimed}
        onChange={(v) => onChange({ ...value, claimed: v })}
        label="Claimed"
      />
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
