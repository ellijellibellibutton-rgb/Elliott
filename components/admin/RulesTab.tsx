"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Rule } from "@/lib/types";
import { Field, TextInput, TextArea, Select, Button, Modal, ConfirmButton, ErrorBanner } from "./ui";

type FormState = Omit<Rule, "id" | "order">;
const EMPTY: FormState = { section: "COMPETITION", title: "", content: "" };

export default function RulesTab() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState<Rule | null>(null);

  function load() {
    fetch("/api/rules").then((r) => r.json()).then(setRules);
  }
  useEffect(load, []);

  async function add() {
    setError(null);
    try {
      await adminFetch("/api/rules", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY);
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add rule.");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      await adminFetch(`/api/rules/${editing.id}`, { method: "PUT", body: JSON.stringify(editing) });
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update rule.");
    }
  }

  async function remove(r: Rule) {
    await adminFetch(`/api/rules/${r.id}`, { method: "DELETE" });
    load();
  }

  const verification = rules.filter((r) => r.section === "VERIFICATION");
  const competition = rules.filter((r) => r.section === "COMPETITION");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{rules.length} rules</p>
        <Button onClick={() => setShowAdd(true)}>+ Add Rule</Button>
      </div>
      <ErrorBanner message={error} />

      {[
        { label: "Verification Rules", items: verification },
        { label: "Competition Rules", items: competition },
      ].map((group) => (
        <div key={group.label} className="mt-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{group.label}</h3>
          <div className="grid gap-3">
            {group.items.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-900">{r.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{r.content}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button variant="ghost" onClick={() => setEditing(r)}>
                      Edit
                    </Button>
                    <ConfirmButton onConfirm={() => remove(r)}>Delete</ConfirmButton>
                  </div>
                </div>
              </div>
            ))}
            {group.items.length === 0 && (
              <p className="text-sm text-slate-400">No rules in this section yet.</p>
            )}
          </div>
        </div>
      ))}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Rule" wide>
        <RuleForm value={form} onChange={setForm} onSubmit={add} submitLabel="Add Rule" />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Rule" wide>
        {editing && (
          <RuleForm
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

function RuleForm({
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
      <Field label="Section">
        <Select
          value={value.section}
          onChange={(e) => onChange({ ...value, section: e.target.value as Rule["section"] })}
        >
          <option value="VERIFICATION">Verification Rules</option>
          <option value="COMPETITION">Competition Rules</option>
        </Select>
      </Field>
      <Field label="Title">
        <TextInput value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
      </Field>
      <Field label="Content">
        <TextArea value={value.content} onChange={(e) => onChange({ ...value, content: e.target.value })} />
      </Field>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
