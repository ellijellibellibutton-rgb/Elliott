"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Meeting, Sprint } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { Field, TextInput, TextArea, Select, Button, Modal, ConfirmButton, ErrorBanner } from "./ui";

type FormState = {
  title: string;
  date: string;
  sprintId: string;
  energyOpener: string;
  sprintChallenge: string;
  workBlockNotes: string;
  nextMeetingGoal: string;
};

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const EMPTY: FormState = {
  title: "",
  date: nowLocal(),
  sprintId: "",
  energyOpener: "",
  sprintChallenge: "",
  workBlockNotes: "",
  nextMeetingGoal: "",
};

export default function MeetingsTab() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState<Meeting | null>(null);

  function load() {
    fetch("/api/meetings").then((r) => r.json()).then(setMeetings);
    fetch("/api/sprints").then((r) => r.json()).then(setSprints);
  }
  useEffect(load, []);

  async function add() {
    setError(null);
    try {
      await adminFetch("/api/meetings", {
        method: "POST",
        body: JSON.stringify({ ...form, sprintId: form.sprintId || null }),
      });
      setForm(EMPTY);
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add meeting.");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      await adminFetch(`/api/meetings/${editing.id}`, { method: "PUT", body: JSON.stringify(editing) });
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update meeting.");
    }
  }

  async function remove(m: Meeting) {
    setError(null);
    try {
      await adminFetch(`/api/meetings/${m.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete meeting.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{meetings.length} meetings</p>
        <Button onClick={() => setShowAdd(true)}>+ Add Meeting</Button>
      </div>
      <ErrorBanner message={error} />

      <div className="mt-4 grid gap-4">
        {meetings.map((m) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-navy-900">{m.title}</p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(m.date)} {m.sprint && `· ${m.sprint.name}`}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button variant="ghost" onClick={() => setEditing(m)}>
                  Edit
                </Button>
                <ConfirmButton onConfirm={() => remove(m)}>Delete</ConfirmButton>
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {m.energyOpener && <p><span className="font-semibold text-slate-500">Energy Opener: </span>{m.energyOpener}</p>}
              {m.sprintChallenge && <p><span className="font-semibold text-slate-500">Sprint Challenge: </span>{m.sprintChallenge}</p>}
              {m.workBlockNotes && <p><span className="font-semibold text-slate-500">Work Block: </span>{m.workBlockNotes}</p>}
              {m.nextMeetingGoal && <p><span className="font-semibold text-slate-500">Next Goal: </span>{m.nextMeetingGoal}</p>}
            </div>
          </div>
        ))}
        {meetings.length === 0 && <p className="text-sm text-slate-400">No meetings scheduled yet.</p>}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={add} title="Add Meeting" wide>
        <MeetingForm value={form} sprints={sprints} onChange={setForm} submitLabel="Add Meeting" />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} onSubmit={saveEdit} title="Edit Meeting" wide>
        {editing && (
          <MeetingForm
            value={{
              title: editing.title,
              date: editing.date.slice(0, 16),
              sprintId: editing.sprintId ?? "",
              energyOpener: editing.energyOpener,
              sprintChallenge: editing.sprintChallenge,
              workBlockNotes: editing.workBlockNotes,
              nextMeetingGoal: editing.nextMeetingGoal,
            }}
            sprints={sprints}
            onChange={(v) => setEditing({ ...editing, ...v, sprintId: v.sprintId || null })}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}

function MeetingForm({
  value,
  sprints,
  onChange,
  submitLabel,
}: {
  value: FormState;
  sprints: Sprint[];
  onChange: (v: FormState) => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title">
          <TextInput value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
        </Field>
        <Field label="Date & Time">
          <TextInput
            type="datetime-local"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Sprint">
        <Select value={value.sprintId} onChange={(e) => onChange({ ...value, sprintId: e.target.value })}>
          <option value="">No sprint</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Energy Opener">
        <TextArea
          value={value.energyOpener}
          onChange={(e) => onChange({ ...value, energyOpener: e.target.value })}
        />
      </Field>
      <Field label="Sprint Challenge">
        <TextArea
          value={value.sprintChallenge}
          onChange={(e) => onChange({ ...value, sprintChallenge: e.target.value })}
        />
      </Field>
      <Field label="Work Block Notes">
        <TextArea
          value={value.workBlockNotes}
          onChange={(e) => onChange({ ...value, workBlockNotes: e.target.value })}
        />
      </Field>
      <Field label="Finish Strong — Next Meeting Goal">
        <TextArea
          value={value.nextMeetingGoal}
          onChange={(e) => onChange({ ...value, nextMeetingGoal: e.target.value })}
        />
      </Field>
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
