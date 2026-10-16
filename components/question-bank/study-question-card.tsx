"use client";

import React, { useState, useEffect } from "react";
import { Question } from "@/types";
import { MathText } from "@/components/ui/math-text";
import {
  Bookmark,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";

interface StudyQuestionCardProps {
  index: number;
  question: Question;
  isBookmarked: boolean;
  onToggleBookmark: (questionId: string) => Promise<void>;
  subjectName?: string;
  defaultRevealed?: boolean;
}

export function StudyQuestionCard({
  index,
  question,
  isBookmarked,
  onToggleBookmark,
  subjectName,
  defaultRevealed = false,
}: StudyQuestionCardProps) {
  const [isRevealed, setIsRevealed] = useState(defaultRevealed);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Sync when parent changes the global reveal state
  useEffect(() => {
    setIsRevealed(defaultRevealed);
    if (!defaultRevealed) {
      setSelectedOptionId(null);
    }
  }, [defaultRevealed]);

  const toggleReveal = () => {
    setIsRevealed((prev) => !prev);
  };

  const handleOptionClick = (optionId: string) => {
    setSelectedOptionId(optionId);
    setIsRevealed(true);
  };

  const handleBookmark = async () => {
    setBookmarkLoading(true);
    try {
      await onToggleBookmark(question.id);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleCopyQuestion = () => {
    const letters = ["(ক)", "(খ)", "(গ)", "(ঘ)", "(ঙ)"];
    const formatted = [
      `প্রশ্ন: ${question.question}`,
      ...question.options.map((opt, i) => `${letters[i] || `(${opt.id.toUpperCase()})`} ${opt.text}`),
      `সঠিক উত্তর: ${question.options.find((o) => o.id === question.correctOptionId)?.text || question.correctOptionId}`,
      question.explanation ? `\nব্যাখ্যা:\n${question.explanation}` : "",
      question.source ? `\n[উৎস: ${question.source}]` : "",
      `\n— মেধাবী (Medhavi) প্রশ্ন ব্যাংক থেকে সংগৃহীত`,
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const optionLabels = ["A", "B", "C", "D", "E"];
  const bnOptionLabels = ["ক", "খ", "গ", "ঘ", "ঙ"];

  // Source / Batch label
  const sourceLabel =
    question.source || (question.tags?.find((t) => t.includes("bcs"))?.toUpperCase() ?? "BCS Question");

  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between">
      {/* 1. Card Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Question Index Badge */}
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Q. {index + 1}
            </span>

            {/* Source / Batch Badge */}
            {sourceLabel && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                {sourceLabel}
              </span>
            )}

            {/* Subject Badge */}
            {subjectName && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {subjectName}
              </span>
            )}

            {/* Difficulty Badge */}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                question.difficulty === "easy"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : question.difficulty === "medium"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              }`}
            >
              {question.difficulty === "easy"
                ? "সহজ"
                : question.difficulty === "medium"
                ? "মধ্যম"
                : "কঠিন"}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            title={isBookmarked ? "সংরক্ষণ তালিকা থেকে সরান" : "বুকমার্ক তালিকায় সংরক্ষণ করুন"}
            className={`p-1.5 rounded-lg border transition-all ${
              isBookmarked
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-500"
                : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
          </button>
        </div>

        {/* Question Text */}
        <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed pt-1">
          <MathText text={question.question} />
        </div>
      </div>

      {/* 2. Options Grid */}
      <div className="px-4 sm:px-5 pb-4 space-y-2">
        {question.options.map((option, optIdx) => {
          const letter = optionLabels[optIdx] || option.id.toUpperCase();
          const bnLetter = bnOptionLabels[optIdx] || String(optIdx + 1);
          const isCorrect = option.id === question.correctOptionId;
          const isSelected = selectedOptionId === option.id;

          let optionStyle =
            "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 cursor-pointer";
          let badgeStyle =
            "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300";

          if (isRevealed) {
            if (isCorrect) {
              optionStyle =
                "border-emerald-500 dark:border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-medium shadow-xs";
              badgeStyle = "bg-emerald-600 text-white font-bold";
            } else if (isSelected && !isCorrect) {
              optionStyle =
                "border-rose-400 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100";
              badgeStyle = "bg-rose-600 text-white font-bold";
            } else {
              optionStyle =
                "opacity-75 border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionClick(option.id)}
              className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm flex items-start gap-3 transition-all ${optionStyle}`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] shrink-0 transition-colors ${badgeStyle}`}
              >
                {isRevealed && isCorrect ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isRevealed && isSelected && !isCorrect ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : (
                  letter
                )}
              </span>

              <div className="flex-1 pt-0.5 leading-relaxed">
                <MathText text={option.text} />
              </div>

              {isRevealed && isCorrect && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 shrink-0">
                  সঠিক উত্তর
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Reveal Answer & Explanation Action Bar */}
      <div className="px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40">
        <button
          type="button"
          onClick={toggleReveal}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
            isRevealed
              ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
              : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
          }`}
        >
          {isRevealed ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>উত্তর ও ব্যাখ্যা লুকান (Hide Answer)</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>উত্তর ও ব্যাখ্যা দেখুন (Reveal Answer & Explanation)</span>
            </>
          )}
        </button>

        {selectedOptionId && (
          <div className="text-xs font-medium">
            {selectedOptionId === question.correctOptionId ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                আপনার উত্তর সঠিক!
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold inline-flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" />
                আপনার উত্তর ভুল
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. Detailed Explanation Drawer */}
      {isRevealed && question.explanation && (
        <div className="border-t border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 sm:p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">
            <Lightbulb className="h-4 w-4" />
            <span>বিস্তারিত ব্যাখ্যা ও সমাধান (Explanation)</span>
          </div>
          <div className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <MathText text={question.explanation} />
          </div>
        </div>
      )}

      {/* 5. Card Footer: Tags & Copy Action */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#111827] flex items-center justify-between text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
          {question.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopyQuestion}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>কপি প্রশ্ন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
