import React from "react";
import Link from "next/link";
import { GraduationCap, Smartphone, BookOpen, Layers, Download } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";

export default function BcsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors print:bg-white print:text-black">
      {/* Sticky Header (Hidden when printing) */}
      <header className="print:hidden sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight block leading-none">
                মেধাবী
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                বিসিএস প্রশ্ন ও সমাধান
              </span>
            </div>
          </Link>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              href="/bcs"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold"
            >
              সকল বিসিএস ব্যাচ
            </Link>
            <Link
              href="/question-bank"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              <span>প্রশ্ন ব্যাংক</span>
            </Link>
            <Link
              href="/exams"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <Layers className="h-4 w-4" />
              <span>মক পরীক্ষা</span>
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <Smartphone className="h-4 w-4" />
              <span>অ্যান্ড্রয়েড অ্যাপ</span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/download"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>APK ডাউনলোড</span>
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
            >
              লগইন / রেজিস্টার
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 print:p-0 print:max-w-none">
        {children}
      </main>

      {/* Footer (Hidden when printing) */}
      <footer className="print:hidden mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0E1322]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              মেধাবী (Medhavi)
            </span>
            <span>— ১০ম থেকে ৫০তম বিসিএস প্রিলিমিনারি প্রশ্ন ব্যাংক ও মডেল টেস্ট</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/bcs" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              বিসিএস ব্যাচসমূহ
            </Link>
            <Link href="/question-bank" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              প্রশ্ন ব্যাংক
            </Link>
            <Link href="/exams" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              পরীক্ষাসমূহ
            </Link>
            <Link href="/download" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              অ্যাপ ডাউনলোড
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
