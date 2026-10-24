"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { formatNumberByLang } from "@/lib/constants/bcs-batches";

export type Language = "bn" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (bnText: string, enText: string) => string;
  n: (value: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("bn");

  useEffect(() => {
    const saved = localStorage.getItem("medhavi_lang") as Language | null;
    if (saved === "bn" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("medhavi_lang", newLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "bn" ? "en" : "bn";
      localStorage.setItem("medhavi_lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (bnText: string, enText: string) => (lang === "bn" ? bnText : enText),
    [lang]
  );

  const n = useCallback(
    (value: number | string) => formatNumberByLang(value, lang),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, n }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
