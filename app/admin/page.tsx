"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import LoginGate from "@/components/admin/LoginGate";
import GeneralSettingsTab from "@/components/admin/GeneralSettingsTab";
import TeamsTab from "@/components/admin/TeamsTab";
import ScoringTab from "@/components/admin/ScoringTab";
import ActivitiesTab from "@/components/admin/ActivitiesTab";
import SprintsTab from "@/components/admin/SprintsTab";
import JudgesTab from "@/components/admin/JudgesTab";
import RulesTab from "@/components/admin/RulesTab";
import PrizesTab from "@/components/admin/PrizesTab";
import AwardsTab from "@/components/admin/AwardsTab";
import MeetingsTab from "@/components/admin/MeetingsTab";
import DataManagementTab from "@/components/admin/DataManagementTab";

const TABS = [
  { key: "general", label: "General Settings", icon: "⚙️", Component: GeneralSettingsTab },
  { key: "teams", label: "Teams", icon: "👥", Component: TeamsTab },
  { key: "scoring", label: "Scoring", icon: "💰", Component: ScoringTab },
  { key: "activities", label: "Activities", icon: "📋", Component: ActivitiesTab },
  { key: "sprints", label: "Sprints", icon: "🏁", Component: SprintsTab },
  { key: "judges", label: "Judges", icon: "⚖️", Component: JudgesTab },
  { key: "rules", label: "Rules", icon: "📜", Component: RulesTab },
  { key: "prizes", label: "Prizes", icon: "🎁", Component: PrizesTab },
  { key: "awards", label: "Awards", icon: "🏅", Component: AwardsTab },
  { key: "meetings", label: "Meetings", icon: "📅", Component: MeetingsTab },
  { key: "data", label: "Data Management", icon: "🗄️", Component: null },
] as const;

export default function AdminPage() {
  const [authState, setAuthState] = useState<"checking" | "unauthenticated" | "authenticated">(
    "checking"
  );
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("general");

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthState(d.authenticated ? "authenticated" : "unauthenticated"))
      .catch(() => setAuthState("unauthenticated"));
  }, []);

  if (authState === "checking") {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-400">Loading…</div>;
  }

  if (authState === "unauthenticated") {
    return <LoginGate onSuccess={() => setAuthState("authenticated")} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
          ⚙️ Admin Control Panel
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage every part of the Corporate Giving Hub. Changes apply immediately.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-2 overflow-x-auto pb-2 lg:w-56 lg:flex-col lg:overflow-visible lg:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold transition-colors",
                activeTab === tab.key
                  ? "bg-navy-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <span aria-hidden>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {TABS.map((tab) => {
            if (tab.key !== activeTab) return null;
            if (tab.key === "data") {
              return (
                <DataManagementTab key={tab.key} onLogout={() => setAuthState("unauthenticated")} />
              );
            }
            const Component = tab.Component!;
            return <Component key={tab.key} />;
          })}
        </div>
      </div>
    </div>
  );
}
