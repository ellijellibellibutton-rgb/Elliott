"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Team } from "@/lib/types";
import TeamAvatar from "@/components/TeamAvatar";
import {
  Field,
  TextInput,
  TextArea,
  Button,
  Modal,
  ConfirmButton,
  ErrorBanner,
} from "./ui";

const EMPTY_TEAM = { name: "", description: "", slogan: "", color: "#2a78d6", logo: "" };

export default function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_TEAM);
  const [editing, setEditing] = useState<Team | null>(null);
  const [memberDrafts, setMemberDrafts] = useState<Record<string, string>>({});

  function load() {
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTeams);
  }
  useEffect(load, []);

  async function addTeam() {
    setError(null);
    try {
      await adminFetch("/api/teams", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY_TEAM);
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add team.");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      await adminFetch(`/api/teams/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editing.name,
          description: editing.description,
          slogan: editing.slogan,
          color: editing.color,
          logo: editing.logo,
        }),
      });
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update team.");
    }
  }

  async function toggleArchive(team: Team) {
    setError(null);
    try {
      await adminFetch(`/api/teams/${team.id}`, {
        method: "PUT",
        body: JSON.stringify({ archived: !team.archived }),
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update team.");
    }
  }

  async function deleteTeam(team: Team) {
    setError(null);
    try {
      await adminFetch(`/api/teams/${team.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete team.");
    }
  }

  async function addMember(teamId: string) {
    const name = memberDrafts[teamId]?.trim();
    if (!name) return;
    setError(null);
    try {
      await adminFetch("/api/students", { method: "POST", body: JSON.stringify({ name, teamId }) });
      setMemberDrafts((d) => ({ ...d, [teamId]: "" }));
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add member.");
    }
  }

  async function removeMember(studentId: string) {
    setError(null);
    try {
      await adminFetch(`/api/students/${studentId}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove member.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{teams.length} teams</p>
        <Button onClick={() => setShowAdd(true)}>+ Add Team</Button>
      </div>
      <ErrorBanner message={error} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {teams.map((team) => (
          <div key={team.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <TeamAvatar color={team.color} logo={team.logo} name={team.name} />
                <div>
                  <p className="font-bold text-navy-900">
                    {team.name} {team.archived && <span className="text-xs text-slate-400">(archived)</span>}
                  </p>
                  <p className="text-xs text-slate-500">{team.slogan}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button variant="ghost" onClick={() => setEditing(team)}>
                  Edit
                </Button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{team.description}</p>

            <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Members ({team.students.length})
              </p>
              <ul className="space-y-1">
                {team.students.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{s.name}</span>
                    <button
                      onClick={() => removeMember(s.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <TextInput
                  placeholder="Add member name…"
                  value={memberDrafts[team.id] ?? ""}
                  onChange={(e) => setMemberDrafts((d) => ({ ...d, [team.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addMember(team.id)}
                  className="flex-1"
                />
                <Button variant="secondary" onClick={() => addMember(team.id)}>
                  Add
                </Button>
              </div>
            </div>

            <div className="mt-3 flex gap-2 border-t border-[var(--border-subtle)] pt-3">
              <Button variant="secondary" onClick={() => toggleArchive(team)}>
                {team.archived ? "Unarchive" : "Archive"}
              </Button>
              <ConfirmButton onConfirm={() => deleteTeam(team)}>Delete</ConfirmButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addTeam} title="Add Team">
        <TeamForm value={form} onChange={setForm} submitLabel="Add Team" />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} onSubmit={saveEdit} title="Edit Team">
        {editing && (
          <TeamForm
            value={editing}
            onChange={(v) => setEditing({ ...editing, ...v })}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}

function TeamForm({
  value,
  onChange,
  submitLabel,
}: {
  value: { name: string; description: string; slogan: string; color: string; logo: string };
  onChange: (v: typeof value) => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <Field label="Team Name">
        <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </Field>
      <Field label="Slogan">
        <TextInput value={value.slogan} onChange={(e) => onChange({ ...value, slogan: e.target.value })} />
      </Field>
      <Field label="Description">
        <TextArea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Team Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.color}
              onChange={(e) => onChange({ ...value, color: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-[var(--border-subtle)]"
            />
            <TextInput value={value.color} onChange={(e) => onChange({ ...value, color: e.target.value })} />
          </div>
        </Field>
        <Field label="Logo / Avatar (emoji)">
          <TextInput
            value={value.logo}
            maxLength={4}
            onChange={(e) => onChange({ ...value, logo: e.target.value })}
            placeholder="🚀"
          />
        </Field>
      </div>
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
