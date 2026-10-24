"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Target,
  BarChart3,
  RotateCcw,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { MobileAppDownload } from "@/components/shared/mobile-app-download";
import { useLanguage } from "@/lib/context/language-context";
import { useAuth } from "@/lib/context/auth-context";

export default function LandingPage() {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "মেধাবী (Medhavi) — Smart BCS & Job Exam Preparation",
        url: "https://medhavi-nine.vercel.app",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web, Android",
        inLanguage: ["bn", "en"],
        description:
          "Bangladesh's #1 Smart BCS (10th–50th BCS) & Government Job Exam Preparation Platform with 5,423+ verified questions, live mock tests, adaptive practice, and analytics.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BDT",
        },
      },
      {
        "@type": "EducationalOrganization",
        name: "Medhavi (মেধাবী)",
        url: "https://medhavi-nine.vercel.app",
        sameAs: ["https://github.com/bilash-biswas/studyhub"],
      },
    ],
  };

  const bpscSubjects = [
    { bn: "বাংলা ভাষা ও সাহিত্য", en: "Bengali Language & Lit", marks: "35" },
    { bn: "English Language & Lit", en: "English Language & Lit", marks: "35" },
    { bn: "বাংলাদেশ বিষয়াবলি", en: "Bangladesh Affairs", marks: "30" },
    { bn: "আন্তর্জাতিক বিষয়াবলি", en: "International Affairs", marks: "20" },
    { bn: "ভূগোল, পরিবেশ ও দুর্যোগ", en: "Geography & Environment", marks: "10" },
    { bn: "সাধারণ বিজ্ঞান", en: "General Science", marks: "15" },
    { bn: "কম্পিউটার ও তথ্যপ্রযুক্তি", en: "Computer & ICT", marks: "15" },
    { bn: "গাণিতিক যুক্তি", en: "Mathematical Reasoning", marks: "15" },
    { bn: "মানসিক দক্ষতা", en: "Mental Ability", marks: "15" },
    { bn: "নৈতিকতা, মূল্যবোধ ও সুশাসন", en: "Ethics & Good Governance", marks: "10" },
  ];

  const features = [
    {
      icon: BookOpen,
      title: t(
        "১০ম–৫০তম বিসিএস প্রশ্ন ব্যাংক",
        "10th–50th BCS Question Bank"
      ),
      description: t(
        "৫,৪২৩+ অ্যাডমিন-ভেরিফাইড বিসিএস ও সরকারি চাকরির প্রশ্ন, নির্ভুল উত্তর ও বিস্তারিত ব্যাখ্যাসহ।",
        "Browse 5,423+ admin-verified BCS & government job MCQs with accurate keys and detailed explanations."
      ),
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
    },
    {
      icon: FileSpreadsheet,
      title: t(
        "রিয়েল-টাইম মক পরীক্ষা",
        "Real-Time Mock Exams"
      ),
      description: t(
        "কাউন্টডাউন টাইমার, নেগেটিভ মার্কিং (-০.৫০) এবং প্রশ্ন প্যালেটসহ আসল পরীক্ষার অভিজ্ঞতা।",
        "Experience realistic exam pressure with countdown timers, -0.50 negative marking, and question palettes."
      ),
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    {
      icon: Target,
      title: t(
        "বিষয় ও ব্যাচ ভিত্তিক অনুশীলন",
        "Subject & Batch-Wise Practice"
      ),
      description: t(
        "যেকোনো বিষয়, টপিক বা নির্দিষ্ট বিসিএস ব্যাচ (১০ম–৫০তম) সিলেক্ট করে তাৎক্ষণিক ফিডব্যাকসহ অনুশীলন করুন।",
        "Customize sessions by subject, topic, difficulty, or specific BCS batch (10th–50th) with instant feedback."
      ),
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    },
    {
      icon: RotateCcw,
      title: t(
        "স্মার্ট ভুল ব্যাংক (Mistake Vault)",
        "Smart Mistake Vault"
      ),
      description: t(
        "পরীক্ষায় ভুল করা প্রতিটি প্রশ্ন স্বয়ংক্রিয়ভাবে ভুল ব্যাংকে জমা হয়, যাতে পরবর্তীতে রিভিশন দিয়ে মাস্টার করতে পারেন।",
        "Every wrong answer is automatically saved to your Mistake Vault so you can re-practice and master weak areas."
      ),
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    },
    {
      icon: BarChart3,
      title: t(
        "গভীর পারফরম্যান্স অ্যানালিটিক্স",
        "Deep Performance Analytics"
      ),
      description: t(
        "বিষয়ভিত্তিক নির্ভুলতা, গড় সময় এবং দুর্বল টপিক চিহ্নিত করতে ভিজ্যুয়াল চার্ট ও রিপোর্ট।",
        "Visualize subject-wise accuracy, speed metrics, and weak topics with interactive charts and progress insights."
      ),
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
    },
    {
      icon: Trophy,
      title: t(
        "লাইভ লিডারবোর্ড ও ডেইলি স্ট্রিক",
        "Live Leaderboard & Daily Streak"
      ),
      description: t(
        "সারা দেশের পরীক্ষার্থীদের সাথে নিজের অবস্থান তুলনা করুন এবং প্রতিদিনের স্ট্রিক বজায় রাখুন।",
        "Compete with aspirants nationwide, track your percentile rank, and maintain your daily study streak."
      ),
      color: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B0F19]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block leading-none">
                {t("মেধাবী", "Medhavi")}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t("বিসিএস ও জব প্রস্তুতি", "BCS & Job Prep")}
              </span>
            </div>
          </Link>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              href="/question-bank"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t("প্রশ্ন ব্যাংক", "Question Bank")}
            </Link>
            <Link
              href="/exams"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t("মক পরীক্ষা", "Mock Exams")}
            </Link>
            <Link
              href="/practice"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t("স্মার্ট অনুশীলন", "Practice")}
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <Smartphone className="h-4 w-4" />
              {t("অ্যান্ড্রয়েড অ্যাপ", "Android App")}
            </Link>
          </nav>

          {/* Right Actions: Language, Theme, Auth CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageToggle />
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("অ্যাডমিন", "Admin")}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{t("ড্যাশবোর্ডে যান", "Dashboard")}</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t("লগইন", "Sign In")}
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 sm:px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
                >
                  {t("ফ্রি শুরু করুন", "Get Started")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-22 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {t(
                "বিসিএস (১০ম–৫০তম), ব্যাংক ও সরকারি চাকরি প্রস্তুতির স্মার্ট প্ল্যাটফর্ম",
                "Built for BCS (10th–50th), Bank & Government Job Aspirants"
              )}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {t("পরীক্ষার প্রস্তুতি হোক আরও ", "Master Your Exams with ")}{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {t(
                "গোছানো, নির্ভুল ও আত্মবিশ্বাসী",
                "Smart Practice & Real-Time Analytics"
              )}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {t(
              "১০ম থেকে ৫০তম বিসিএসের ৫,৪২৩+ ভেরিফাইড প্রশ্ন ব্যাংক, রিয়েল-টাইম মক টেস্ট, ভুল ব্যাংক (Mistake Vault) এবং গভীর পারফরম্যান্স অ্যানালিটিক্স নিয়ে মেধাবী (Medhavi) আপনার সাফল্যের সেরা সঙ্গী।",
              "Practice with 5,423+ verified 10th–50th BCS questions, take timed mock exams with negative marking, review every mistake automatically, and track your subject-wise mastery."
            )}
          </p>

          {/* Primary Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("আপনার ড্যাশবোর্ডে প্রবেশ করুন", "Go to Your Dashboard")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                {t("ফ্রি প্রস্তুতি শুরু করুন", "Start Practicing Free")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/question-bank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition-all"
            >
              <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              {t("প্রশ্ন ব্যাংক দেখুন", "Explore Question Bank")}
            </Link>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {t("১০০% ফ্রি অ্যাক্সেস", "100% Free Access")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {t(
                "১০ম–৫০তম বিসিএস ভেরিফাইড প্রশ্ন",
                "10th–50th BCS Verified Archive"
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {t(
                "ওয়েব ও অ্যান্ড্রয়েড অ্যাপ সিঙ্ক",
                "Web & Android App Sync"
              )}
            </span>
          </div>

          {/* Live Platform KPI Strip */}
          <div className="pt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 sm:p-5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {t("৫,৪২৩+", "5,423+")}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                {t("ভেরিফাইড MCQ প্রশ্ন", "Verified MCQ Questions")}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {t("বিস্তারিত ব্যাখ্যাসহ", "With detailed explanations")}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 sm:p-5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {t("১০ম–৫০তম", "10th–50th")}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                {t("বিসিএস প্রশ্ন আর্কাইভ", "BCS Official Archive")}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {t("৪১টি বিসিএস ব্যাচ ফিল্টার", "41 BCS exam batches")}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 sm:p-5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                {t("১০টি বিষয়", "10 Subjects")}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                {t("পূর্ণাঙ্গ পিএসসি সিলেবাস", "Full BPSC Syllabus")}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {t("২০০ নম্বরের মানবণ্টন", "200-mark distribution")}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 sm:p-5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {t("১০০% ফ্রি", "100% Free")}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                {t("মক টেস্ট ও ভুল ব্যাংক", "Mock Tests & Mistake Vault")}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {t("কোনো লুকানো চার্জ নেই", "No hidden subscription")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BPSC 10-Subject Quick Explorer Strip */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {t(
                  "পিএসসি সিলেবাস অনুযায়ী ১০টি বিষয়ের প্রশ্ন ব্যাংক",
                  "All 10 BPSC Preliminary Subjects Covered"
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  "যেকোনো বিষয়ে ক্লিক করে সরাসরি প্রশ্ন ব্যাংক বা অনুশীলন শুরু করুন",
                  "Click any subject to jump straight into verified BCS questions"
                )}
              </p>
            </div>
            <Link
              href="/question-bank"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t("সবগুলো বিষয় দেখুন", "View All Subjects")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {bpscSubjects.map((sub, i) => (
              <Link
                key={i}
                href="/question-bank"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs"
              >
                <span>{t(sub.bn, sub.en)}</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                  {t(`${sub.marks} নম্বর`, `${sub.marks}M`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#111827]/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t(
                "সাফল্যের জন্য যা কিছু প্রয়োজন, সবই এক প্ল্যাটফর্মে",
                "Everything You Need to Succeed in One Platform"
              )}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              {t(
                "শুধু মুখস্থ নয় — অ্যাক্টিভ রিকল, ভুল সংশোধন এবং ডেটা-ভিত্তিক প্রস্তুতির মাধ্যমে নিজেকে এগিয়ে রাখুন।",
                "Designed around active recall, mistake recovery, and data-driven preparation."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#111827] hover:border-indigo-500/40 transition-all space-y-4"
                >
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${feat.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile App Download & QR Banner Section */}
      <section className="pt-14 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <MobileAppDownload variant="banner" />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 sm:p-12 text-center text-white space-y-6 shadow-xl shadow-indigo-600/20">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t(
              "আপনার বিসিএস ও সরকারি চাকরির প্রস্তুতিকে পরবর্তী ধাপে নিয়ে যেতে প্রস্তুত?",
              "Ready to Elevate Your BCS & Job Exam Preparation?"
            )}
          </h2>
          <p className="max-w-xl mx-auto text-indigo-100 text-sm sm:text-base">
            {t(
              "আজই মেধাবী (Medhavi) প্ল্যাটফর্মে যুক্ত হোন — প্রতিদিন অনুশীলন করুন, নিজের দুর্বলতা চিহ্নিত করুন এবং লক্ষ্যে পৌঁছান।",
              "Join Medhavi today and turn your daily practice sessions into measurable exam readiness."
            )}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-colors shadow-md"
            >
              {user
                ? t("ড্যাশবোর্ডে ফিরে যান", "Go to Dashboard")
                : t("ফ্রি অ্যাকাউন্ট খুলুন", "Create Your Free Account")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {t("মেধাবী (Medhavi)", "Medhavi")}
            </span>
            <span>
              —{" "}
              {t(
                "স্মার্ট বিসিএস ও জব প্রস্তুতি প্ল্যাটফর্ম",
                "Smart Exam Preparation Platform"
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <Link
              href="/question-bank"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {t("প্রশ্ন ব্যাংক", "Question Bank")}
            </Link>
            <Link
              href="/exams"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {t("মক টেস্ট", "Mock Exams")}
            </Link>
            <Link
              href="/download"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {t("মোবাইল অ্যাপ", "Mobile App")}
            </Link>
            <Link
              href="/login"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {t("লগইন", "Sign In")}
            </Link>
            <Link
              href="/register"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {t("রেজিস্টার", "Register")}
            </Link>
          </div>

          <p className="text-xs">
            {t(
              `© ${new Date().getFullYear()} মেধাবী (Medhavi) • সর্বস্বত্ব সংরক্ষিত।`,
              `© ${new Date().getFullYear()} Medhavi. All rights reserved.`
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
