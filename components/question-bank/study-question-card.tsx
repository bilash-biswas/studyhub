"use client";

import React, { useState, useEffect } from "react";
import { Question } from "@/types";
import { MathText } from "@/components/ui/math-text";
import { useLanguage } from "@/lib/context/language-context";
import {
  Bookmark,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lightbulb,
  Trash2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export interface StudyQuestionCardProps {
  index: number;
  question: Question;
  isBookmarked: boolean;
  onToggleBookmark: (questionId: string) => Promise<void>;
  subjectName?: string;
  defaultRevealed?: boolean;
  initialSelectedOptionId?: string | null;
  onAnswerSelect?: (optionId: string) => void;
  onRemove?: () => void;
  removeTooltip?: string;
  showPracticeSingle?: boolean;
  onPracticeSingle?: (question: Question) => void;
}

export function StudyQuestionCard({
  index,
  question,
  isBookmarked,
  onToggleBookmark,
  subjectName,
  defaultRevealed = false,
  initialSelectedOptionId = null,
  onAnswerSelect,
  onRemove,
  removeTooltip = "তালিকা থেকে সরান",
  showPracticeSingle = false,
  onPracticeSingle,
}: StudyQuestionCardProps) {
  const { lang, t, n } = useLanguage();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    initialSelectedOptionId
  );
  const [isRevealed, setIsRevealed] = useState(
    defaultRevealed || Boolean(initialSelectedOptionId)
  );
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Sync when parent updates initialSelectedOptionId
  useEffect(() => {
    if (initialSelectedOptionId !== undefined && initialSelectedOptionId !== null) {
      setSelectedOptionId(initialSelectedOptionId);
      setIsRevealed(true);
    }
  }, [initialSelectedOptionId]);

  // Sync when parent changes the global reveal state
  useEffect(() => {
    setIsRevealed(defaultRevealed);
  }, [defaultRevealed]);

  const toggleReveal = () => {
    setIsRevealed((prev) => !prev);
  };

  const handleOptionClick = (optionId: string) => {
    setSelectedOptionId(optionId);
    setIsRevealed(true);
    onAnswerSelect?.(optionId);
  };

  const handleBookmark = async () => {
    setBookmarkLoading(true);
    try {
      await onToggleBookmark(question.id);
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Dynamic Option Labels: Bangla (ক, খ, গ, ঘ) vs English (A, B, C, D)
  const optionLabels = lang === "bn" ? ["ক", "খ", "গ", "ঘ", "ঙ"] : ["A", "B", "C", "D", "E"];

  // Source / Batch label
  const sourceLabel =
    question.source || (question.tags?.find((t) => t.includes("bcs"))?.toUpperCase() ?? "");

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      {/* 1. Quiet Header (Metadata + Actions) */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Question Index Badge */}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {t(`প্রশ্ন ${n(index + 1)}`, `Q. ${index + 1}`)}
          </span>

          {/* Source / Batch */}
          {sourceLabel && (
            <>
              <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {sourceLabel}
              </span>
            </>
          )}

          {/* Subject */}
          {subjectName && (
            <>
              <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
              <span className="text-slate-500 dark:text-slate-400">
                {subjectName}
              </span>
            </>
          )}

          {/* Difficulty */}
          {question.difficulty && (
            <>
              <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
              <span
                className={`font-semibold ${
                  question.difficulty === "easy"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : question.difficulty === "hard"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {question.difficulty === "easy"
                  ? t("সহজ", "Easy")
                  : question.difficulty === "medium"
                  ? t("মধ্যম", "Medium")
                  : t("কঠিন", "Hard")}
              </span>
            </>
          )}

          {/* Admin Verified */}
          {question.adminVerified && (
            <>
              <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
              <span
                title={t("বিসিএস বিশেষজ্ঞ প্যানেল দ্বারা পরীক্ষিত ও নির্ভুল", "Verified by Admin Panel")}
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t("ভেরিফাইড", "Verified")}</span>
              </span>
            </>
          )}
        </div>

        {/* Quiet Top-Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Optional Remove (Bookmarks / Mistakes) */}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title={removeTooltip}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            title={
              isBookmarked
                ? t("সংরক্ষণ তালিকা থেকে সরান", "Remove bookmark")
                : t("বুকমার্ক করুন", "Bookmark question")
            }
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isBookmarked
                ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Question Prompt */}
      <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-3">
        <MathText text={question.question} />
      </div>

      {/* Optional Question Image */}
      {question.imageUrl && (
        <div className="mb-3 relative max-w-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <img
            src={question.imageUrl}
            alt="Question illustration"
            className="max-h-56 object-contain"
          />
        </div>
      )}

      {/* 3. Clean Option Tiles */}
      <div className="space-y-2 mb-3">
        {question.options.map((option, optIdx) => {
          const letter = optionLabels[optIdx] || option.id.toUpperCase();
          const isCorrect = option.id === question.correctOptionId;
          const isSelected = selectedOptionId === option.id;

          let optionStyle =
            "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/20";
          let badgeStyle =
            "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300";

          if (isRevealed) {
            if (isCorrect) {
              optionStyle =
                "border-emerald-500 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-medium";
              badgeStyle = "bg-emerald-600 text-white font-bold";
            } else if (isSelected && !isCorrect) {
              optionStyle =
                "border-rose-400 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100";
              badgeStyle = "bg-rose-600 text-white font-bold";
            } else {
              optionStyle =
                "opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400";
              badgeStyle = "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionClick(option.id)}
              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${optionStyle}`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] shrink-0 transition-colors mt-0.5 ${badgeStyle}`}
              >
                {isRevealed && isCorrect ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isRevealed && isSelected && !isCorrect ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : (
                  letter
                )}
              </span>

              <div className="flex-1 leading-relaxed">
                <MathText text={option.text} />
              </div>

              {/* Trailing Minimal Indicator Icon */}
              {isRevealed && isCorrect && (
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0 self-center">
                  ✓
                </span>
              )}
              {isRevealed && isSelected && !isCorrect && (
                <span className="text-rose-600 dark:text-rose-400 text-xs font-bold shrink-0 self-center">
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Seamless Inline Reveal & Explanation */}
      <div className="pt-1">
        {!isRevealed ? (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleReveal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1 transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{t("উত্তর ও ব্যাখ্যা দেখুন", "Reveal Answer & Explanation")}</span>
            </button>

            {showPracticeSingle && onPracticeSingle && (
              <button
                type="button"
                onClick={() => onPracticeSingle(question)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-indigo-600" />
                <span>{t("একক অনুশীলন", "Practice Single")}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleReveal}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span>{t("লুকান", "Hide")}</span>
              </button>

              {selectedOptionId && (
                <span
                  className={`text-xs font-semibold inline-flex items-center gap-1 ${
                    selectedOptionId === question.correctOptionId
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {selectedOptionId === question.correctOptionId ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{t("আপনার উত্তর সঠিক!", "Correct Answer!")}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      <span>{t("ভুল উত্তর", "Incorrect")}</span>
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Explanation Box */}
            {question.explanation && (
              <div className="rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-950/80 p-3.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>{t("ব্যাখ্যা", "Explanation")}</span>
                </div>
                <MathText text={question.explanation} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
