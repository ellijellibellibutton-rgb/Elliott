"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Users,
  Coins,
  ClipboardList,
  Flag,
  Scale,
  ScrollText,
  Gift,
  Medal,
  CalendarDays,
  Database,
} from "lucide-react";
import LoginGate from "@/components/admin/LoginGate";
import IconBadge from "@/components/IconBadge";
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
  { key: "general", label: "General Settings", icon: Settings, Component: GeneralSettingsTab },
  { key: "teams", label: "Teams", icon: Users, Component: TeamsTab },
  { key: "scoring", label: "Scoring", icon: Coins, Component: ScoringTab },
  { key: "activities", label: "Activities", icon: ClipboardList, Component: ActivitiesTab },
  { key: "sprints", label: "Sprints", icon: Flag, Component: SprintsTab },
  { key: "judges", label: "Judges", icon: Scale, Component: JudgesTab },
  { key: "rules", label: "Rules", icon: ScrollText, Component: RulesTab },
  { key: "prizes", label: "Prizes", icon: Gift, Component: PrizesTab },
  { key: "awards", label: "Awards", icon: Medal, Component: AwardsTab },
  { key: "meetings", label: "Meetings", icon: CalendarDays, Component: MeetingsTab },
  { key: "data", label: "Data Management", icon: Database, Component: null },
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
      <div className="mb-6 flex items-center gap-3">
        <IconBadge icon={Settings} color="#4a3aa7" size="lg" solid />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
            Admin Control Panel
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage every part of the Corporate Giving Hub. Changes apply immediately.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-2 overflow-x-auto pb-2 lg:w-56 lg:flex-col lg:overflow-visible lg:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold transition-colors",
                activeTab === tab.key ? "text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {activeTab === tab.key && (
                <motion.span
                  layoutId="admin-tab-active"
                  className="absolute inset-0 rounded-lg bg-navy-900"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <tab.icon size={16} strokeWidth={2.25} aria-hidden />
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {TABS.map((tab) => {
              if (tab.key !== activeTab) return null;
              return (
                <motion.div
                  key={tab.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.key === "data" ? (
                    <DataManagementTab onLogout={() => setAuthState("unauthenticated")} />
                  ) : (
                    (() => {
                      const Component = tab.Component!;
                      return <Component />;
                    })()
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
