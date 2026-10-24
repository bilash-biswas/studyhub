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
      title={lang === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
      aria-label="Toggle language between Bengali and English"
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
    >
      <Languages className="h-3.5 w-3.5 text-[#4F46E5] dark:text-[#818CF8]" />
      <span>{lang === "bn" ? "বাংলা" : "EN"}</span>
    </button>
  );
}
