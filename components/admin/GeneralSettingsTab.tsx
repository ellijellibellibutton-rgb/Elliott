"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { CampaignSettings } from "@/lib/types";
import { Field, TextInput, TextArea, Toggle, Button, ErrorBanner, SuccessBanner } from "./ui";

function toDateInput(v: string | null) {
  if (!v) return "";
  return new Date(v).toISOString().slice(0, 10);
}

export default function GeneralSettingsTab() {
  const [settings, setSettings] = useState<CampaignSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  if (!settings) return <p className="text-sm text-slate-400">Loading settings…</p>;

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminFetch<CampaignSettings>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSettings(updated);
      setSuccess("Settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="max-w-2xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <Field label="Campaign Name">
        <TextInput
          value={settings.campaignName}
          onChange={(e) => setSettings({ ...settings, campaignName: e.target.value })}
        />
      </Field>

      <Field label="Campaign Description">
        <TextArea
          value={settings.campaignDescription}
          onChange={(e) => setSettings({ ...settings, campaignDescription: e.target.value })}
        />
      </Field>

      <Field label="Committee Name">
        <TextInput
          value={settings.committeeName}
          onChange={(e) => setSettings({ ...settings, committeeName: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Campaign Start Date">
          <TextInput
            type="date"
            value={toDateInput(settings.startDate)}
            onChange={(e) => setSettings({ ...settings, startDate: e.target.value || null })}
          />
        </Field>
        <Field label="Campaign End Date">
          <TextInput
            type="date"
            value={toDateInput(settings.endDate)}
            onChange={(e) => setSettings({ ...settings, endDate: e.target.value || null })}
          />
        </Field>
      </div>

      <Field label="Meeting Schedule" hint="e.g. Every Tuesday at 6:00 PM — Room 214">
        <TextInput
          value={settings.meetingSchedule}
          onChange={(e) => setSettings({ ...settings, meetingSchedule: e.target.value })}
        />
      </Field>

      <Field label="Primary Accent Color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.primaryAccent}
            onChange={(e) => setSettings({ ...settings, primaryAccent: e.target.value })}
            className="h-10 w-14 cursor-pointer rounded border border-[var(--border-subtle)]"
          />
          <TextInput
            value={settings.primaryAccent}
            onChange={(e) => setSettings({ ...settings, primaryAccent: e.target.value })}
            className="w-32"
          />
        </div>
      </Field>

      <Field
        label="Hero Image URL"
        hint="Optional. A photo shown behind the homepage hero banner (e.g. an approved AAPLE event/team photo). Leave blank for the default gradient background."
      >
        <TextInput
          value={settings.heroImageUrl}
          onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
          placeholder="https://..."
        />
      </Field>

      <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Display Settings</p>
        <Toggle
          checked={settings.showTeamAvatars}
          onChange={(v) => setSettings({ ...settings, showTeamAvatars: v })}
          label="Show team avatars/logos"
        />
        <Toggle
          checked={settings.showMoversOnDash}
          onChange={(v) => setSettings({ ...settings, showMoversOnDash: v })}
          label="Show biggest mover on dashboard"
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
