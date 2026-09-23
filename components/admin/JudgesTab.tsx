"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Judge } from "@/lib/types";
import { Field, TextInput, TextArea, Button, Modal, ConfirmButton, ErrorBanner } from "./ui";

type FormState = Omit<Judge, "id" | "order">;
const EMPTY: FormState = { name: "", role: "", responsibilities: "" };

export default function JudgesTab() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState<Judge | null>(null);

  function load() {
    fetch("/api/judges").then((r) => r.json()).then(setJudges);
  }
  useEffect(load, []);

  async function add() {
    setError(null);
    try {
      await adminFetch("/api/judges", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY);
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add judge.");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      await adminFetch(`/api/judges/${editing.id}`, { method: "PUT", body: JSON.stringify(editing) });
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update judge.");
    }
  }

  async function remove(j: Judge) {
    setError(null);
    try {
      await adminFetch(`/api/judges/${j.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete judge.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{judges.length} judges</p>
        <Button onClick={() => setShowAdd(true)}>+ Add Judge</Button>
      </div>
      <ErrorBanner message={error} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {judges.map((j) => (
          <div key={j.id} className="card p-5">
            <p className="font-bold text-navy-900">{j.name}</p>
            <p className="text-sm font-semibold text-blue-600">{j.role}</p>
            <p className="mt-1 text-sm text-slate-600">{j.responsibilities}</p>
            <div className="mt-3 flex gap-2 border-t border-[var(--border-subtle)] pt-3">
              <Button variant="ghost" onClick={() => setEditing(j)}>
                Edit
              </Button>
              <ConfirmButton onConfirm={() => remove(j)}>Delete</ConfirmButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={add} title="Add Judge">
        <JudgeForm value={form} onChange={setForm} submitLabel="Add Judge" />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} onSubmit={saveEdit} title="Edit Judge">
        {editing && (
          <JudgeForm
            value={editing}
            onChange={(v) => setEditing({ ...editing, ...v })}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}

function JudgeForm({
  value,
  onChange,
  submitLabel,
}: {
  value: FormState;
  onChange: (v: FormState) => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <Field label="Name">
        <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </Field>
      <Field label="Role">
        <TextInput value={value.role} onChange={(e) => onChange({ ...value, role: e.target.value })} />
      </Field>
      <Field label="Responsibilities">
        <TextArea
          value={value.responsibilities}
          onChange={(e) => onChange({ ...value, responsibilities: e.target.value })}
        />
      </Field>
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
