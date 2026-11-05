"use client";

import React, { useState } from "react";
import { Question } from "@/types";
import { MathText } from "@/components/ui/math-text";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Check,
  Copy,
  Sparkles,
} from "lucide-react";
import { DAILY_SUBJECT_INFO } from "./daily-runner";

function toBnDigits(num: number | string): string {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bn[parseInt(d, 10)] ?? d);
}

const OPTION_LABELS_BN = ["ক", "খ", "গ", "ঘ", "ঙ"];

interface DailyQuestionReviewProps {
  questions: Question[];
}

export function DailyQuestionReview({ questions }: DailyQuestionReviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyExplanation = (q: Question) => {
    if (!q.explanation) return;
    navigator.clipboard.writeText(q.explanation);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              আজকের ৫টি প্রশ্ন ও পূর্ণাঙ্গ সমাধান দেখুন
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              প্রতিটি প্রশ্নের বিস্তারিত ব্যাখ্যা এবং সঠিক উত্তর পর্যালোচনা করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          <span>{isOpen ? "লুকান" : "বিস্তারিত"}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Question Review List */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
          {questions.map((q, idx) => {
            const sub = DAILY_SUBJECT_INFO[q.subjectId] || {
              nameBn: "সাধারণ জ্ঞান",
              icon: "🎯",
            };

            return (
              <div key={q.id} className="p-5 sm:p-6 space-y-4">
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      প্রশ্ন {toBnDigits(idx + 1)}.
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                      <span>{sub.icon}</span>
                      <span>{sub.nameBn}</span>
                    </span>
                  </div>

                  {q.source && (
                    <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {q.source}
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  <MathText text={q.question} />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = opt.id === q.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                          isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-semibold text-emerald-950 dark:text-emerald-100"
                            : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span
                          className={`h-6 w-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {OPTION_LABELS_BN[optIdx] || opt.id}
                        </span>
                        <div className="flex-1">
                          <MathText text={opt.text} />
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            সঠিক উত্তর ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="p-4 rounded-xl border-l-3 border-indigo-500 bg-white dark:bg-[#111827] border-y border-r border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>বিস্তারিত সমাধান ও তথ্য:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyExplanation(q)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === q.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-600">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>কপি</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-xs">
                      <MathText text={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
