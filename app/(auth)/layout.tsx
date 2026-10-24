"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Trophy,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { MobileAppDownload } from "@/components/shared/mobile-app-download";
import { useLanguage } from "@/lib/context/language-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Top Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("হোমে ফিরে যান", "Back to Home")}
        </Link>
        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area: Responsive 2-Column Split on Desktop */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Auth Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            {/* Brand Logo Header */}
            <div className="flex flex-col items-center lg:items-start mb-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
                    {t("মেধাবী", "Medhavi")}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t(
                      "স্মার্ট বিসিএস প্রস্তুতি প্ল্যাটফর্ম",
                      "Smart BCS Exam Prep Platform"
                    )}
                  </span>
                </div>
              </Link>
            </div>

            {children}
          </div>

          {/* Right Column: Platform Value Prop & Mobile App QR Card */}
          <div className="lg:col-span-6 w-full max-w-md lg:max-w-none mx-auto space-y-5">
            {/* Platform Highlights Box */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#111827]/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {t(
                    "১০০% ফ্রি বিসিএস ও সরকারি চাকরি প্রস্তুতি",
                    "100% Free BCS & Govt Job Preparation"
                  )}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {t(
                  "কেন মেধাবী (Medhavi) প্ল্যাটফর্মে যুক্ত হবেন?",
                  "Why Prepare with Medhavi?"
                )}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {t("৫,৪২৩+ ভেরিফাইড MCQ", "5,423+ Verified MCQs")}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(
                        "১০ম–৫০তম বিসিএস নির্ভুল ব্যাখ্যাসহ",
                        "10th–50th BCS with explanations"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {t("১০টি পূর্ণাঙ্গ বিষয়", "All 10 BPSC Subjects")}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(
                        "বিষয় ও ব্যাচ ভিত্তিক স্মার্ট প্র্যাকটিস",
                        "Subject & batch-wise practice"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <Trophy className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {t("লাইভ মক টেস্ট ও র‍্যাঙ্কিং", "Live Mock & Leaderboard")}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(
                        "নেগেটিভ মার্কিং ও টাইমার সিমুলেশন",
                        "Negative marking & real timers"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {t("ভুল ব্যাংক ও স্ট্রিক ট্র্যাকার", "Mistake Vault & Streak")}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(
                        "ওয়েব ও মোবাইল অ্যাপ সিঙ্ক সুবিধা",
                        "Real-time Web & Android sync"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile App QR & Download Card */}
            <MobileAppDownload variant="card" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        {t(
          "© ২০২৬ মেধাবী (Medhavi) • বিসিএস ও সরকারি চাকরি প্রস্তুতি প্ল্যাটফর্ম • সর্বস্বত্ব সংরক্ষিত।",
          "© 2026 Medhavi • Smart BCS & Govt Job Preparation Platform • All rights reserved."
        )}
      </footer>
    </div>
  );
}
