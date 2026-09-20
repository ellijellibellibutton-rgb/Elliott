"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import { Field, TextInput, Button, ConfirmButton, ErrorBanner, SuccessBanner } from "./ui";

export default function DataManagementTab({ onLogout }: { onLogout: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  async function changePassword() {
    setPwError(null);
    setPwSuccess(null);
    if (newPassword !== confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    try {
      await adminFetch("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPwSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Failed to change password.");
    }
  }

  async function runAction(action: "clear-demo-data" | "clear-all-activities") {
    setDataError(null);
    setDataMessage(null);
    try {
      const res = await adminFetch<{ message: string }>("/api/admin/data", {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setDataMessage(res.message);
    } catch (e) {
      setDataError(e instanceof Error ? e.message : "Action failed.");
    }
  }

  async function exportData() {
    const res = await fetch("/api/admin/data");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `corporate-giving-hub-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await adminFetch("/api/admin/logout", { method: "POST" });
    onLogout();
  }

  return (
    <div className="max-w-xl space-y-10">
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Change Admin Password</h3>
        <div className="card mt-3 space-y-4 p-5">
          <ErrorBanner message={pwError} />
          <SuccessBanner message={pwSuccess} />
          <Field label="Current Password">
            <TextInput
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>
          <Field label="New Password">
            <TextInput type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>
          <Field label="Confirm New Password">
            <TextInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
          <Button onClick={changePassword}>Update Password</Button>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Data Management</h3>
        <div className="card mt-3 space-y-4 p-5">
          <ErrorBanner message={dataError} />
          <SuccessBanner message={dataMessage} />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-navy-900">Export all data</p>
              <p className="text-sm text-slate-500">Download a full JSON snapshot of the database.</p>
            </div>
            <Button variant="secondary" onClick={exportData}>
              Export JSON
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
            <div>
              <p className="font-semibold text-navy-900">Clear demo/example data</p>
              <p className="text-sm text-slate-500">
                Removes every record flagged as demo data (seeded teams, activities, etc.) so you can start fresh.
              </p>
            </div>
            <ConfirmButton onConfirm={() => runAction("clear-demo-data")}>Clear Demo Data</ConfirmButton>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
            <div>
              <p className="font-semibold text-navy-900">Clear all logged activities</p>
              <p className="text-sm text-slate-500">
                Deletes every activity entry (teams, scoring, and settings are kept).
              </p>
            </div>
            <ConfirmButton onConfirm={() => runAction("clear-all-activities")}>Clear Activities</ConfirmButton>
          </div>
        </div>
      </section>

      <section>
        <Button variant="secondary" onClick={logout}>
          Log Out
        </Button>
      </section>
    </div>
  );
}
