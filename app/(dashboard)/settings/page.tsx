"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/context/theme-context";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Bell,
  Trash2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [clearedMsg, setClearedMsg] = useState(false);

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 2500);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8]">
            <Settings className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
            Preferences
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Application Settings (সেটিংস)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your interface appearance, session caching, and account preferences.
        </p>
      </div>

      {/* Theme Card */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Interface Appearance (থিম)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose light mode, dark mode, or follow your operating system settings.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
              theme === "light"
                ? "border-[#4F46E5] bg-indigo-50/70 text-[#4F46E5] dark:bg-indigo-950/40 ring-1 ring-[#4F46E5]"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <Sun className="h-5 w-5" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
              theme === "dark"
                ? "border-[#818CF8] bg-indigo-50/70 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-[#818CF8] ring-1 ring-[#818CF8]"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <Moon className="h-5 w-5" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
              theme === "system"
                ? "border-[#4F46E5] bg-indigo-50/70 text-[#4F46E5] dark:bg-indigo-950/40 dark:text-[#818CF8] ring-1 ring-[#4F46E5]"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <Laptop className="h-5 w-5" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Session Data & Cache */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Local Session Cache
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clear temporary session presets and locally cached practice drafts.
          </p>
        </div>

        {clearedMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Local session cache cleared successfully.</span>
          </div>
        )}

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="text-xs gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-500" />
            Clear Session Cache
          </Button>
        </div>
      </div>
    </div>
  );
}
