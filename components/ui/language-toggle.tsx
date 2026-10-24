"use client";

import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/context/language-context";

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      title={lang === "bn" ? "Switch to English (EN)" : "বাংলায় পরিবর্তন করুন"}
      aria-label="Toggle language between Bengali and English"
      className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
    >
      <Languages className="h-3.5 w-3.5 text-[#4F46E5] dark:text-[#818CF8] shrink-0" />
      <span>{lang === "bn" ? "বাং" : "EN"}</span>
    </button>
  );
}
