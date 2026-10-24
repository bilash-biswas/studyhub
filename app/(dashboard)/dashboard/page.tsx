"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/context/language-context";
import { getUserRecentAttempts } from "@/lib/services/attempt-service";
import { getUserBookmarkIds } from "@/lib/services/bookmark-service";
import { getUserMistakeQuestionIds } from "@/lib/services/analytics-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects } from "@/lib/services/subject-service";
import {
  getNotifications,
  matchesStreakTarget,
} from "@/lib/services/notification-service";
import { Attempt, Exam, Subject, AppNotification } from "@/types";
import { calculateAccuracy } from "@/lib/calculations/accuracy";
import { evaluateActiveStreak } from "@/lib/calculations/streak";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Timer,
  AlertTriangle,
  Bookmark,
  Flame,
  Target,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Bell,
} from "lucide-react";
import { MobileAppDownload } from "@/components/shared/mobile-app-download";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t, n } = useLanguage();

  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      try {
        const [attList, exList, subList, bms, mistakes, notifList] =
          await Promise.all([
            getUserRecentAttempts(user.uid, 5),
            getExams(),
            getSubjects(),
            getUserBookmarkIds(user.uid),
            getUserMistakeQuestionIds(user.uid),
            getNotifications(15),
          ]);

        setRecentAttempts(attList);
        setExams(exList);
        setSubjects(subList);
        setBookmarkCount(bms.length);
        setMistakeCount(mistakes.length);
        setNotifications(notifList);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const examMap = new Map(exams.map((e) => [e.id, e.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const streakEval = evaluateActiveStreak({
    currentStreak: profile?.currentStreak,
    lastPracticeDate: profile?.lastPracticeDate,
  });
  const currentStreak = streakEval.effectiveStreak;
  const totalQuestions = profile?.totalQuestionsAnswered || 0;
  const totalCorrect = profile?.totalCorrect || 0;
  const accuracy = calculateAccuracy(totalCorrect, totalQuestions);

  const pinnedNotifications = notifications.filter(
    (item) => item.isPinned && matchesStreakTarget(item, currentStreak)
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            {t("ড্যাশবোর্ড লোড হচ্ছে...", "Loading your dashboard...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Pinned Admin Announcement / Streak Banner */}
      {pinnedNotifications.length > 0 && (
        <div className="space-y-2.5">
          {pinnedNotifications.slice(0, 2).map((pin) => (
            <div
              key={pin.id}
              onClick={() => pin.actionUrl && router.push(pin.actionUrl)}
              className="p-4 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-linear-to-r from-indigo-600/10 via-indigo-50/80 to-white dark:from-indigo-950/60 dark:via-indigo-900/20 dark:to-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-indigo-500 transition-all shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {pin.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {pin.body}
                  </p>
                </div>
              </div>
              {pin.actionUrl && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {t("বিস্তারিত দেখুন", "Open Now")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 bg-linear-to-r from-white via-indigo-50/20 to-white dark:from-[#111827] dark:via-indigo-950/20 dark:to-[#111827]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              <Flame className="h-3.5 w-3.5 fill-current text-amber-500" />
              {t(`${n(currentStreak)} দিনের স্ট্রিক`, `${currentStreak} Day Streak`)}
            </span>
            <span className="text-xs text-slate-500">
              {streakEval.status === "practiced_today"
                ? t(
                    "✅ আজকের স্ট্রিক সুরক্ষিত!",
                    "✅ Today's streak protected!"
                  )
                : streakEval.status === "at_risk_today"
                ? t(
                    "⏳ স্ট্রিক বাঁচাতে আজ অনুশীলন করুন!",
                    "⏳ Practice today to keep your streak!"
                  )
                : t(
                    "স্ট্রিক ০ — আজই অনুশীলন শুরু করুন!",
                    "Streak is 0 — Practice today to start!"
                  )}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t(
              `স্বাগতম, ${profile?.name || user?.displayName || "প্রার্থী"}!`,
              `Welcome back, ${profile?.name || user?.displayName || "Candidate"}!`
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
            {t(
              "বিসিএস প্রিলিমিনারি (১০ম–৫০তম), ব্যাংক জব এবং সরকারি চাকরির পূর্ণাঙ্গ প্রস্তুতি প্ল্যাটফর্ম।",
              "Bangladesh Civil Service (BCS), Bank Recruitment, and Government Career Preparation Platform."
            )}
          </p>
        </div>

        {/* Quick Launch Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/practice")}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 shadow-xs h-9 px-4"
          >
            <Sparkles className="h-4 w-4" />
            {t("অনুশীলন শুরু করুন", "Start Practice")}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/exams")}
            className="text-xs gap-1.5 h-9 px-4"
          >
            <Timer className="h-4 w-4 text-sky-500" />
            {t("মডেল টেস্ট", "Mock Exams")}
          </Button>
        </div>
      </div>

      {/* Mobile App Download QR Code Banner */}
      <MobileAppDownload variant="banner" />

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Questions Solved */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {t("সমাধানকৃত প্রশ্ন", "Questions Solved")}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {n(totalQuestions)}
            </div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {t("সঠিকতার হার", "Overall Accuracy")}
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {n(accuracy)}%
            </div>
          </div>
        </div>

        {/* Mistake Bank */}
        <Link
          href="/mistakes"
          className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 hover:border-amber-300 transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium group-hover:text-amber-600 transition-colors">
              {t("ভুল প্রশ্ন ব্যাংক", "Mistake Bank")}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {n(mistakeCount)}
            </div>
          </div>
        </Link>

        {/* Saved Bookmarks */}
        <Link
          href="/bookmarks"
          className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 hover:border-indigo-300 transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">
              {t("সংরক্ষিত বুকমার্ক", "Saved Bookmarks")}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {n(bookmarkCount)}
            </div>
          </div>
        </Link>
      </div>

      {/* Action Launchpad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Practice Module */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {t("এমসিকিউ অনুশীলন ইঞ্জিন", "MCQ Practice Engine")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                "১০ম–৫০তম বিসিএস ব্যাচ, বিষয় এবং কাঠিন্য অনুযায়ী তাৎক্ষণিক ব্যাখ্যা ও গাণিতিক সমাধানসহ অনুশীলন করুন।",
                "Customizable drills by BCS batch, subject, and difficulty with instant mathematical feedback."
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/practice")}
            className="text-xs justify-between w-full"
          >
            <span>{t("অনুশীলন সাজান", "Configure Practice")}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Mock Exams */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Timer className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {t("টাইমড মডেল টেস্ট", "Timed Mock Tests")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                "নেগেটিভ মার্কিং এবং কাউন্টডাউন টাইমারসহ বিসিএস প্রিলিমিনারি ও ব্যাংক পরীক্ষার পূর্ণাঙ্গ সিমুলেশন।",
                "Simulate actual BCS Preliminary and Bank exams with real timers, negative marking, and question palettes."
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/exams")}
            className="text-xs justify-between w-full"
          >
            <span>{t("মডেল টেস্ট দেখুন", "Browse Mock Exams")}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Analytics & Diagnosis */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {t("দুর্বল অধ্যায় বিশ্লেষণ", "Weak-Topic Analytics")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                "আপনার কম সঠিকতা থাকা বিষয় ও টপিকগুলো চিহ্নিত করুন এবং ১-ক্লিকে টার্গেটেড ড্রিল করুন।",
                "Identify your low-accuracy subjects and syllabus tags with automated recommendations."
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/analytics")}
            className="text-xs justify-between w-full"
          >
            <span>{t("পূর্ণাঙ্গ রিপোর্ট দেখুন", "View Full Report")}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t("সাম্প্রতিক অনুশীলনের ইতিহাস", "Recent Practice History")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "আপনার সাম্প্রতিক স্কোর এবং বিস্তারিত উত্তর মূল্যায়ন পর্যালোচনা করুন।",
                "Review your recent scores and detailed answer evaluations."
              )}
            </p>
          </div>

          <Link
            href="/analytics"
            className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1"
          >
            {t("সব দেখুন", "See all")}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="p-10 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500">
              {t("এখনও কোনো অনুশীলন রেকর্ড করা হয়নি।", "No practice attempts recorded yet.")}
            </p>
            <Button
              size="sm"
              onClick={() => router.push("/practice")}
              className="text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t("প্রথম অনুশীলন শুরু করুন", "Take Your First Practice Session")}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAttempts.map((att) => {
              const examName = att.examId ? examMap.get(att.examId) : null;
              const subName = att.subjectId ? subjectMap.get(att.subjectId) : null;
              const title = subName || examName || t("সাধারণ অনুশীলন", "General Practice");

              return (
                <div
                  key={att.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        att.mode === "exam"
                          ? "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400"
                          : "bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8]"
                      }`}
                    >
                      {att.mode === "exam" ? (
                        <Timer className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t(
                          `${n(att.totalQuestions)}টি প্রশ্ন • ${n(att.accuracy)}% সঠিকতা • স্কোর: ${n(att.score)}`,
                          `${att.totalQuestions} Questions • ${att.accuracy}% Accuracy • Score: ${att.score}`
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        att.percentage >= 80
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : att.percentage >= 50
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {n(att.percentage)}%
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/results/${att.id}`)}
                      className="text-xs h-7 px-2.5 text-slate-600 dark:text-slate-300 hover:text-[#4F46E5]"
                    >
                      {t("পর্যালোচনা", "Review")}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
