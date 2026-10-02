"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserRecentAttempts } from "@/lib/services/attempt-service";
import { getUserBookmarkIds } from "@/lib/services/bookmark-service";
import { getUserMistakeQuestionIds } from "@/lib/services/analytics-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects } from "@/lib/services/subject-service";
import { Attempt, Exam, Subject } from "@/types";
import { calculateAccuracy } from "@/lib/calculations/accuracy";
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
  Calendar,
  Clock,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Trophy,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      try {
        const [attList, exList, subList, bms, mistakes] = await Promise.all([
          getUserRecentAttempts(user.uid, 5),
          getExams(),
          getSubjects(),
          getUserBookmarkIds(user.uid),
          getUserMistakeQuestionIds(user.uid),
        ]);

        setRecentAttempts(attList);
        setExams(exList);
        setSubjects(subList);
        setBookmarkCount(bms.length);
        setMistakeCount(mistakes.length);
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

  const currentStreak = profile?.currentStreak || 0;
  const totalQuestions = profile?.totalQuestionsAnswered || 0;
  const totalCorrect = profile?.totalCorrect || 0;
  const accuracy = calculateAccuracy(totalCorrect, totalQuestions);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 bg-linear-to-r from-white via-indigo-50/20 to-white dark:from-[#111827] dark:via-indigo-950/20 dark:to-[#111827]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              <Flame className="h-3.5 w-3.5 fill-current text-amber-500" />
              {currentStreak} Day Streak
            </span>
            <span className="text-xs text-slate-500">
              {currentStreak > 0 ? "Keep the fire burning!" : "Practice today to start a streak!"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {profile?.name || user?.displayName || "Candidate"}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
            Bangladesh Civil Service (BCS), Bank Recruitment, and HSC Exam Preparation Platform.
          </p>
        </div>

        {/* Quick Launch Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/practice")}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 shadow-xs h-9 px-4"
          >
            <Sparkles className="h-4 w-4" />
            Start Practice
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/exams")}
            className="text-xs gap-1.5 h-9 px-4"
          >
            <Timer className="h-4 w-4 text-sky-500" />
            Mock Exams
          </Button>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Questions Solved */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Questions Solved</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {totalQuestions}
            </div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Overall Accuracy</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {accuracy}%
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
              Mistake Bank
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {mistakeCount}
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
              Saved Bookmarks
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {bookmarkCount}
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
              MCQ Practice Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Customizable drills by exam syllabus, subject, and difficulty with instant mathematical feedback.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/practice")}
            className="text-xs justify-between w-full"
          >
            <span>Configure Practice</span>
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
              Timed Mock Tests
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Simulate actual BCS Preliminary and Bank exams with real timers, negative marking, and question palettes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/exams")}
            className="text-xs justify-between w-full"
          >
            <span>Browse Mock Exams</span>
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
              Weak-Topic Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Identify your low-accuracy subjects and syllabus tags with automated recommendations.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/analytics")}
            className="text-xs justify-between w-full"
          >
            <span>View Full Report</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Practice History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review your recent scores and detailed answer evaluations.
            </p>
          </div>

          <Link
            href="/analytics"
            className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1"
          >
            See all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="p-10 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500">No practice attempts recorded yet.</p>
            <Button
              size="sm"
              onClick={() => router.push("/practice")}
              className="text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Take Your First Practice Session
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAttempts.map((att) => {
              const examName = att.examId ? examMap.get(att.examId) : null;
              const subName = att.subjectId ? subjectMap.get(att.subjectId) : null;
              const title = subName || examName || "General Practice";

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
                        {att.totalQuestions} Questions • {att.accuracy}% Accuracy • Score: {att.score}
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
                      {att.percentage}%
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/results/${att.id}`)}
                      className="text-xs h-7 px-2.5 text-slate-600 dark:text-slate-300 hover:text-[#4F46E5]"
                    >
                      Review
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
