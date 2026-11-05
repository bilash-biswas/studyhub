import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * High-fidelity Skeleton loader matching StudyQuestionCard exactly
 */
export function QuestionCardSkeleton({
  count = 3,
  density = "detailed",
}: {
  count?: number;
  density?: "detailed" | "compact";
}) {
  return (
    <div className="space-y-3.5" role="status" aria-label="Loading questions">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4"
        >
          {/* Header Metadata */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md hidden sm:block" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
          </div>

          {/* Question Prompt */}
          <div className="space-y-2 pt-1">
            <Skeleton className="h-5 w-11/12 rounded-lg" />
            <Skeleton className="h-5 w-3/4 rounded-lg" />
          </div>

          {/* Options */}
          {density === "detailed" && (
            <div className="space-y-2 pt-1">
              {[1, 2, 3, 4].map((opt) => (
                <div
                  key={opt}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3"
                >
                  <Skeleton className="h-6 w-6 rounded-lg shrink-0" />
                  <Skeleton
                    className={`h-4 rounded-md ${
                      opt % 2 === 0 ? "w-2/5" : "w-3/5"
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Footer Toggle */}
          {density === "detailed" && (
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-8 w-36 rounded-xl" />
              <Skeleton className="h-4 w-28 rounded-md hidden sm:block" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Page Skeleton matching streak hero, quick actions, and 4 KPI cards
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      {/* Greeting Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-52 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Streak Hero Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 bg-white dark:bg-[#111827] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>

      {/* Recent Activity Card */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4">
        <Skeleton className="h-5 w-40 rounded-md" />
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Exam Catalog Skeleton matching category pills, filter bar, and mock test cards
 */
export function ExamCatalogSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading exams">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Exam Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-xl shrink-0" />
        ))}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl shrink-0 hidden sm:block" />
      </div>

      {/* Mock Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-4/5 rounded-md" />
              <Skeleton className="h-3.5 w-3/5 rounded-md" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Leaderboard Skeleton matching top-3 podium and table rankings
 */
export function LeaderboardSkeleton({
  inlineOnly = false,
}: {
  inlineOnly?: boolean;
}) {
  const content = (
    <div className="space-y-6" role="status" aria-label="Loading leaderboard scores">
      {/* Top-3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col items-center text-center space-y-3 ${
              i === 1 ? "sm:-translate-y-2 border-amber-300 dark:border-amber-700/60" : ""
            }`}
          >
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-1 w-full flex flex-col items-center">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Rankings Table Rows */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-2 space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (inlineOnly) return content;

  return (
    <div className="space-y-6" role="status" aria-label="Loading leaderboard">
      {/* Header and Period Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-7 w-44 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
      </div>
      {content}
    </div>
  );
}

/**
 * Analytics Page Skeleton
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading analytics">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-2.5"
          >
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4">
        <Skeleton className="h-5 w-48 rounded-md" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Workspace Shell Skeleton replacing full-screen spinner in layout
 */
export function DashboardShellSkeleton() {
  return (
    <div
      className="min-h-screen flex bg-slate-50 dark:bg-[#0F172A]"
      role="status"
      aria-label="Loading Medhavi workspace"
    >
      {/* Desktop Sidebar Shell */}
      <aside className="hidden lg:flex w-[268px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <DashboardSkeleton />
      </main>
    </div>
  );
}
