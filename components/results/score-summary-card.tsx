"use client";

import React from "react";
import { Attempt } from "@/types";
import { formatTimer } from "@/lib/calculations/timer";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Percent,
  Clock,
  Zap,
  Target,
} from "lucide-react";

interface ScoreSummaryCardProps {
  attempt: Attempt;
  examTitle?: string;
  subjectTitle?: string;
}

export function ScoreSummaryCard({
  attempt,
  examTitle,
  subjectTitle,
}: ScoreSummaryCardProps) {
  const {
    score,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    skippedQuestions,
    accuracy,
    percentage,
    durationSeconds,
    mode,
    correctMark,
    wrongMark,
  } = attempt;

  const maxScore = totalQuestions * (correctMark || 1);
  const avgTimePerQuestion =
    totalQuestions > 0 ? Math.round(durationSeconds / totalQuestions) : 0;

  // Performance Assessment Tag
  let performanceBadge = {
    label: "Needs Practice",
    color: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-900",
  };
  if (percentage >= 80) {
    performanceBadge = {
      label: "Excellent Performance",
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    };
  } else if (percentage >= 60) {
    performanceBadge = {
      label: "Good Progress",
      color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    };
  } else if (percentage >= 40) {
    performanceBadge = {
      label: "Average — Needs Review",
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    };
  }

  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Banner */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-[#111827] dark:to-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                {mode === "exam" ? "Mock Exam Result" : "Practice Session Summary"}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${performanceBadge.color}`}
              >
                {performanceBadge.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {subjectTitle || examTitle || "Practice Result"}
            </h1>
            {examTitle && subjectTitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {examTitle} • {subjectTitle}
              </p>
            )}
          </div>

          {/* Large Score Display */}
          <div className="flex items-baseline gap-2 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Final Score</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#4F46E5] dark:text-[#818CF8]">
                {score}
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {" "}/ {maxScore}
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Score %</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Negative marking note if applicable */}
        {wrongMark > 0 && (
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Negative marking applied:</span>
            <span>+{correctMark} per correct, -{wrongMark} per wrong answer</span>
          </div>
        )}
      </div>

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
        {/* Correct */}
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Correct</div>
            <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {correctAnswers}
              <span className="text-xs font-normal text-slate-500 ml-1">
                ({totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Incorrect */}
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Incorrect</div>
            <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
              {wrongAnswers}
              <span className="text-xs font-normal text-slate-500 ml-1">
                ({totalQuestions > 0 ? Math.round((wrongAnswers / totalQuestions) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Skipped */}
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Skipped</div>
            <div className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">
              {skippedQuestions}
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Accuracy</div>
            <div className="text-lg sm:text-xl font-bold text-[#4F46E5] dark:text-[#818CF8]">
              {accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Meta Row */}
      <div className="px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>
            Total Time: <strong className="text-slate-700 dark:text-slate-300">{formatTimer(durationSeconds)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-slate-500" />
          <span>
            Avg Pace: <strong className="text-slate-700 dark:text-slate-300">{avgTimePerQuestion}s</strong> / question
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-slate-500" />
          <span>
            Questions: <strong className="text-slate-700 dark:text-slate-300">{totalQuestions} total</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
