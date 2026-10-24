"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/context/theme-context";
import { useLanguage } from "@/lib/context/language-context";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Trash2,
  CheckCircle2,
  Languages,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

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
            {t("পছন্দসমূহ", "Preferences")}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {t("অ্যাপ্লিকেশন সেটিংস", "Application Settings")}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t(
            "আপনার ইন্টারফেস ভাষা, থিম এবং লোকাল সেশন ক্যাশ কাস্টমাইজ করুন।",
            "Customize your interface language, appearance, and local session cache."
          )}
        </p>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Languages className="h-4 w-4 text-[#4F46E5] dark:text-[#818CF8]" />
            <span>{t("ইন্টারফেস ভাষা (Language)", "Interface Language")}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              "সমগ্র ওয়েবসাইটে বাংলা অথবা ইংরেজি ইন্টারফেস নির্বাচন করুন।",
              "Choose between Bengali and English across all menus, headers, and controls."
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setLang("bn")}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              lang === "bn"
                ? "border-[#4F46E5] bg-indigo-50/70 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-[#818CF8] ring-1 ring-[#4F46E5]"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <span className="text-base font-bold">বাংলা</span>
            <span className="text-[11px] opacity-80">Bengali (Default)</span>
          </button>

          <button
            type="button"
            onClick={() => setLang("en")}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              lang === "en"
                ? "border-[#4F46E5] bg-indigo-50/70 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-[#818CF8] ring-1 ring-[#4F46E5]"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <span className="text-base font-bold">English</span>
            <span className="text-[11px] opacity-80">ইংরেজি</span>
          </button>
        </div>
      </div>

      {/* Theme Card */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t("ইন্টারফেস থিম (Appearance)", "Interface Appearance")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              "লাইট মোড, ডার্ক মোড অথবা আপনার ডিভাইসের সিস্টেম থিম বেছে নিন।",
              "Choose light mode, dark mode, or follow your operating system settings."
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === "light"
                ? "border-[#4F46E5] bg-indigo-50/70 text-[#4F46E5] dark:bg-indigo-950/40 ring-1 ring-[#4F46E5]"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <Sun className="h-5 w-5" />
            <span>{t("লাইট", "Light")}</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === "dark"
                ? "border-[#818CF8] bg-indigo-50/70 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-[#818CF8] ring-1 ring-[#818CF8]"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <Moon className="h-5 w-5" />
            <span>{t("ডার্ক", "Dark")}</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === "system"
                ? "border-[#4F46E5] bg-indigo-50/70 text-[#4F46E5] dark:bg-indigo-950/40 dark:text-[#818CF8] ring-1 ring-[#4F46E5]"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <Laptop className="h-5 w-5" />
            <span>{t("সিস্টেম", "System")}</span>
          </button>
        </div>
      </div>

      {/* Session Data & Cache */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t("লোকাল সেশন ক্যাশ", "Local Session Cache")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              "অস্থায়ী সেশন প্রিসেট এবং সংরক্ষিত ড্রাফট ডেটা মুছে ফেলুন।",
              "Clear temporary session presets and locally cached practice drafts."
            )}
          </p>
        </div>

        {clearedMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              {t("লোকাল সেশন ক্যাশ সফলভাবে পরিষ্কার করা হয়েছে।", "Local session cache cleared successfully.")}
            </span>
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
            {t("সেশন ক্যাশ মুছুন", "Clear Session Cache")}
          </Button>
        </div>
      </div>
    </div>
  );
}
