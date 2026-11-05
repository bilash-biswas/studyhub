"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Question, Subject } from "@/types";
import { MathText } from "@/components/ui/math-text";
import {
  Printer,
  Timer,
  Eye,
  EyeOff,
  Filter,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Download,
} from "lucide-react";

interface BatchQuestionsViewProps {
  batchId: string;
  batchLabelBn: string;
  batchLabelEn: string;
  questions: Question[];
  subjects: Subject[];
}

export function BatchQuestionsView({
  batchId,
  batchLabelBn,
  batchLabelEn,
  questions,
  subjects,
}: BatchQuestionsViewProps) {
  const router = useRouter();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [revealAll, setRevealAll] = useState<boolean>(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(
    () => new Set(questions.map((q) => q.id))
  );

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((s) => [s.id, s.name]));
  }, [subjects]);

  // Available subjects in this batch
  const availableSubjects = useMemo(() => {
    const ids = new Set(questions.map((q) => q.subjectId).filter(Boolean));
    return subjects.filter((s) => ids.has(s.id));
  }, [questions, subjects]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (selectedSubjectId === "all") return questions;
    return questions.filter((q) => q.subjectId === selectedSubjectId);
  }, [questions, selectedSubjectId]);

  const toggleReveal = (qId: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleToggleRevealAll = () => {
    if (revealAll) {
      setRevealedIds(new Set());
      setRevealAll(false);
    } else {
      setRevealedIds(new Set(questions.map((q) => q.id)));
      setRevealAll(true);
    }
  };

  const handleStartTimedPractice = () => {
    if (questions.length === 0) return;
    const sessionId = `bcs_${batchId}_${Date.now()}`;
    const config = {
      examId: "exam_bcs",
      batchTag: batchId,
      questionIds: questions.map((q) => q.id),
      count: questions.length,
      feedbackMode: "exam",
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`session_${sessionId}`, JSON.stringify(config));
    }
    router.push(`/practice/${sessionId}`);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const optionLabels = ["ক", "খ", "গ", "ঘ", "ঙ"];

  return (
    <div className="space-y-6">
      {/* 1. Interactive Control Header (Hidden when Printing) */}
      <div className="print:hidden bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                বিসিএস প্রিলিমিনারি প্রশ্নপত্র
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {questions.length}টি প্রশ্ন সংগৃহীত
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {batchLabelBn} প্রিলিমিনারি প্রশ্ন ও সম্পূর্ণ সমাধান
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              বিস্তারিত ব্যাখ্যা ও নির্ভুল উত্তর সহ {batchLabelEn} প্রিলিমিনারি পরীক্ষার প্রশ্ন ব্যাংক।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleStartTimedPractice}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Timer className="h-4 w-4" />
              <span>টাইমড টেস্ট দিন</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Printer className="h-4 w-4" />
              <span>PDF / প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={handleToggleRevealAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              {revealAll ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span className="hidden sm:inline">উত্তর লুকান</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">সব উত্তর দেখান</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Subject Filter Pills */}
        {availableSubjects.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedSubjectId("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubjectId === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              সকল বিষয় ({questions.length})
            </button>
            {availableSubjects.map((sub) => {
              const count = questions.filter((q) => q.subjectId === sub.id).length;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubjectId === sub.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {sub.name} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Formal Print-Only Document Header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          মেধাবী (Medhavi) — {batchLabelBn} প্রিলিমিনারি প্রশ্ন ও সমাধান
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          মোট প্রশ্ন: {filteredQuestions.length}টি • সঠিক উত্তর ও ব্যাখ্যা সহ অফলাইন স্টাডি শীট
        </p>
      </div>

      {/* 3. Questions Stream (2-column layout in print) */}
      <div className="space-y-4 print:space-y-4 print:columns-2 print:gap-6">
        {filteredQuestions.map((q, idx) => {
          const isRevealed = revealedIds.has(q.id);
          const subName = subjectMap.get(q.subjectId);

          return (
            <article
              key={q.id}
              className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3 print:border print:border-slate-300 print:shadow-none print:break-inside-avoid print:p-3"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 print:border print:border-slate-400">
                    প্রশ্ন {idx + 1}
                  </span>
                  {subName && (
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      • {subName}
                    </span>
                  )}
                  {q.adminVerified && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] print:hidden">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>ভেরিফাইড</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 print:hidden">
                  <button
                    type="button"
                    onClick={() => toggleReveal(q.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    title={isRevealed ? "উত্তর লুকান" : "উত্তর দেখুন"}
                  >
                    {isRevealed ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <Link
                    href={`/questions/${q.id}`}
                    target="_blank"
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="একক পৃষ্ঠা"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Prompt */}
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                <MathText text={q.question} />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = opt.id === q.correctOptionId;
                  const showCorrect = isRevealed && isCorrect;

                  return (
                    <div
                      key={opt.id || oIdx}
                      className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-colors ${
                        showCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-semibold text-emerald-950 dark:text-emerald-200 print:bg-slate-100 print:border-slate-800"
                          : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          showCorrect
                            ? "bg-emerald-600 text-white print:bg-slate-900"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {optionLabels[oIdx] || String.fromCharCode(65 + oIdx)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <MathText text={opt.text} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation (Shown when revealed) */}
              {isRevealed && q.explanation && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-900/40 p-2.5 rounded-lg print:bg-transparent print:border-none print:p-0">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1 print:text-slate-900">
                    ব্যাখ্যা:
                  </span>
                  <MathText text={q.explanation} />
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* 4. Bottom CTA (Hidden when printing) */}
      <div className="print:hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold">
            এই ব্যাচের সম্পূর্ণ প্রশ্ন অফলাইনে পড়তে চান?
          </h3>
          <p className="text-xs sm:text-sm text-indigo-100">
            মেধাবী অ্যান্ড্রয়েড অ্যাপ ডাউনলোড করুন — ৫,৪২০+ প্রশ্ন ব্যাংক সম্পূর্ণ বিনামূল্যে অফলাইনে পড়ুন।
          </p>
        </div>
        <Link
          href="/download"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition-colors shadow-sm shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>অ্যাপ ডাউনলোড (APK)</span>
        </Link>
      </div>
    </div>
  );
}
