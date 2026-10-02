"use client";

import React, { useState } from "react";
import { Question, AttemptAnswer } from "@/types";
import { MathText } from "@/components/ui/math-text";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";

interface QuestionReviewItemProps {
  index: number;
  question: Question;
  attemptAnswer: AttemptAnswer;
  isBookmarked: boolean;
  onToggleBookmark: (questionId: string) => Promise<void>;
  wrongMark?: number;
  correctMark?: number;
}

export function QuestionReviewItem({
  index,
  question,
  attemptAnswer,
  isBookmarked,
  onToggleBookmark,
  wrongMark = 0,
  correctMark = 1,
}: QuestionReviewItemProps) {
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);

  const { selectedOptionId, isCorrect, timeSpentSeconds } = attemptAnswer;
  const isSkipped = !selectedOptionId;

  const handleBookmarkClick = async () => {
    setBookmarkLoading(true);
    try {
      await onToggleBookmark(question.id);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-[#111827] shadow-xs overflow-hidden transition-all ${
        isCorrect
          ? "border-emerald-200 dark:border-emerald-950/80"
          : isSkipped
          ? "border-slate-200 dark:border-slate-800"
          : "border-red-200 dark:border-red-950/80"
      }`}
    >
      {/* Question Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
            Q{index + 1}
          </span>

          {/* Outcome Status Badge */}
          {isCorrect ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3" />
              Correct (+{correctMark})
            </span>
          ) : isSkipped ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <HelpCircle className="h-3 w-3" />
              Skipped
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800">
              <XCircle className="h-3 w-3" />
              Incorrect {wrongMark > 0 ? `(-${wrongMark})` : "(0)"}
            </span>
          )}

          {/* Difficulty Badge */}
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
              question.difficulty === "easy"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : question.difficulty === "medium"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {question.difficulty}
          </span>
        </div>

        {/* Right side controls: Time and Bookmark */}
        <div className="flex items-center gap-3">
          {timeSpentSeconds > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeSpentSeconds}s
            </span>
          )}

          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={bookmarkLoading}
            title={isBookmarked ? "Remove Bookmark" : "Save Question"}
            className={`p-1.5 rounded-lg border transition-all ${
              isBookmarked
                ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400"
                : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-5 space-y-4">
        {/* Title with Bengali and LaTeX rendering */}
        <div className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
          <MathText text={question.question} />
        </div>

        {/* Optional Question Image */}
        {question.imageUrl && (
          <div className="relative max-w-md rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <img
              src={question.imageUrl}
              alt="Question illustration"
              className="max-h-64 object-contain mx-auto"
            />
          </div>
        )}

        {/* Options List */}
        <div className="space-y-2.5 pt-1">
          {question.options.map((opt, optIdx) => {
            const letter = optionLetters[optIdx] || `${optIdx + 1}`;
            const isOptionCorrect = opt.id === question.correctOptionId;
            const isOptionUserSelected = opt.id === selectedOptionId;

            let borderAndBg =
              "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300";
            let badgeText: string | null = null;
            let badgeClass = "";

            if (isOptionCorrect && isOptionUserSelected) {
              // User picked right answer
              borderAndBg =
                "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/30";
              badgeText = "Your Choice (Correct)";
              badgeClass =
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300";
            } else if (isOptionCorrect && !isOptionUserSelected) {
              // Correct answer user missed
              borderAndBg =
                "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 border-dashed";
              badgeText = "Correct Answer";
              badgeClass =
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300";
            } else if (!isOptionCorrect && isOptionUserSelected) {
              // User picked wrong answer
              borderAndBg =
                "border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-950 dark:text-red-100 ring-1 ring-red-500/30";
              badgeText = "Your Choice (Incorrect)";
              badgeClass =
                "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300";
            }

            return (
              <div
                key={opt.id}
                className={`p-3 sm:p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${borderAndBg}`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isOptionCorrect
                        ? "bg-emerald-600 text-white"
                        : isOptionUserSelected
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {letter}
                  </span>
                  <div className="text-sm font-normal pt-0.5 leading-snug">
                    <MathText text={opt.text} />
                  </div>
                </div>

                {badgeText && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${badgeClass}`}
                  >
                    {badgeText}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Step-by-Step LaTeX Explanation */}
        {question.explanation && (
          <div className="mt-4 pt-2">
            <button
              type="button"
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className="flex items-center justify-between w-full text-left py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>Step-by-Step Solution & Explanation (ব্যাখ্যা ও সমাধান)</span>
              </div>
              {isExplanationOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {isExplanationOpen && (
              <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                <MathText text={question.explanation} />
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
