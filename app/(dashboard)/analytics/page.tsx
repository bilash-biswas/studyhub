"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSubjects } from "@/lib/services/subject-service";
import {
  getUserAggregatedAnalytics,
  UserAnalyticsOverview,
} from "@/lib/services/analytics-service";
import { formatTimer } from "@/lib/calculations/timer";
import { ClassifiedArea } from "@/lib/calculations/weakness";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState<UserAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (!user) return;
      setLoading(true);
      try {
        const subjects = await getSubjects();
        const subMap: Record<string, string> = {};
        subjects.forEach((s) => {
          subMap[s.id] = s.name;
        });

        const data = await getUserAggregatedAnalytics(user.uid, subMap);
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [user]);

  const handleDrillSubject = (subjectId: string) => {
    const newSessionId = `drill_${Date.now()}`;
    const config = {
      subjectId,
      count: 10,
      difficulty: "all",
      feedbackMode: "instant",
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`session_${newSessionId}`, JSON.stringify(config));
    }
    router.push(`/practice/${newSessionId}`);
  };

  const handleDrillTag = (tag: string) => {
    const cleanTag = tag.replace(/^#/, "");
    // Navigate to practice setup with tag filter or direct session
    router.push(`/practice`);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Analyzing practice data & diagnostics...</p>
        </div>
      </div>
    );
  }

  const {
    totalAttempts = 0,
    totalAnswered = 0,
    totalCorrect = 0,
    overallAccuracy = 0,
    totalStudyTimeSeconds = 0,
    rankedSubjects = [],
    rankedTags = [],
    weakAreas = [],
  } = analytics || {};

  const totalStudyMinutes = Math.round(totalStudyTimeSeconds / 60);

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8]">
              <BarChart3 className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
              Continuous Analytics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Performance Analytics & Weak-Topic Diagnosis
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Real-time accuracy metrics and rule-based diagnostic analysis of your preparation progress.
          </p>
        </div>

        <Button
          onClick={() => router.push("/practice")}
          size="sm"
          className="text-xs gap-1.5 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Quick Practice
        </Button>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Answered */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Questions</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {totalAnswered}
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
              {overallAccuracy}%
            </div>
          </div>
        </div>

        {/* Total Study Time */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Study Time</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {totalStudyMinutes}m
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Attempts</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {totalAttempts}
            </div>
          </div>
        </div>
      </div>

      {/* Weak-Area Diagnostic Prescription */}
      {weakAreas.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Weak Area Alerts (দুর্বল অধ্যায় ও টপিক)
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Rule-based diagnostic detected lower accuracy rates in the following subjects/tags:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weakAreas.slice(0, 4).map((area) => (
              <div
                key={area.id}
                className="bg-white dark:bg-[#111827] p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/80 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {area.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Accuracy: <span className="font-semibold text-red-600">{area.accuracy}%</span> ({area.correct}/{area.attempts})
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    area.id.startsWith("#")
                      ? handleDrillTag(area.id)
                      : handleDrillSubject(area.id)
                  }
                  className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] h-7 px-2.5 gap-1"
                >
                  <Zap className="h-3 w-3" />
                  Drill
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Performance Breakdown */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Subject Mastery Breakdown (বিষয়ভিত্তিক দক্ষতা)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track your strengths and identify subjects that require further practice.
          </p>
        </div>

        {rankedSubjects.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No subject practice data available yet. Start a practice session to see performance graphs.
          </div>
        ) : (
          <div className="space-y-3.5">
            {rankedSubjects.map((sub) => {
              let tierColor = "bg-red-500";
              let badgeColor = "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400";
              if (sub.tier === "strong") {
                tierColor = "bg-emerald-500";
                badgeColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
              } else if (sub.tier === "good") {
                tierColor = "bg-indigo-500";
                badgeColor = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300";
              } else if (sub.tier === "needs_improvement") {
                tierColor = "bg-amber-500";
                badgeColor = "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
              }

              return (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {sub.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">
                        {sub.correct}/{sub.attempts} ({sub.accuracy}%)
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDrillSubject(sub.id)}
                        className="text-xs h-6 px-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 gap-1"
                      >
                        Practice
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tierColor} transition-all duration-500`}
                      style={{ width: `${sub.accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tag-by-Tag Syllabus Analysis */}
      {rankedTags.length > 0 && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Topic & Tag Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Granular topic-level breakdown from your practice answers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {rankedTags.map((tag) => (
              <div
                key={tag.id}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs flex items-center gap-2"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {tag.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    tag.accuracy >= 75
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : tag.accuracy >= 50
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  {tag.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
