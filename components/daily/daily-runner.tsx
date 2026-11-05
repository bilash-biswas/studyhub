"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Copy,
  Sparkles,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Question, AttemptAnswer } from "@/types";
import { MathText } from "@/components/ui/math-text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toggleBookmark, isQuestionBookmarked } from "@/lib/services/bookmark-service";

export const DAILY_SUBJECT_INFO: Record<string, { nameBn: string; icon: string; shortBn: string }> = {
  sub_bcs_bangla: { nameBn: "বাংলা ভাষা ও সাহিত্য", icon: "📚", shortBn: "বাংলা" },
  sub_bcs_english: { nameBn: "English Language & Literature", icon: "📖", shortBn: "ইংরেজি" },
  sub_bcs_bd_affairs: { nameBn: "বাংলাদেশ বিষয়াবলী", icon: "🇧🇩", shortBn: "বাংলাদেশ" },
  sub_bcs_intl_affairs: { nameBn: "আন্তর্জাতিক বিষয়াবলী", icon: "🌍", shortBn: "আন্তর্জাতিক" },
  sub_bcs_math: { nameBn: "গাণিতিক যুক্তি", icon: "📐", shortBn: "গণিত" },
  sub_bcs_science: { nameBn: "সাধারণ বিজ্ঞান", icon: "🔬", shortBn: "বিজ্ঞান" },
  sub_bcs_ict: { nameBn: "কম্পিউটার ও তথ্যপ্রযুক্তি", icon: "💻", shortBn: "তথ্যপ্রযুক্তি" },
  sub_bcs_mental_ability: { nameBn: "মানসিক দক্ষতা", icon: "🧠", shortBn: "মানসিক" },
  sub_bcs_geography: { nameBn: "ভূগোল, পরিবেশ ও দুর্যোগ", icon: "🗺️", shortBn: "ভূগোল" },
  sub_bcs_ethics: { nameBn: "নৈতিকতা ও সুশাসন", icon: "⚖️", shortBn: "নৈতিকতা" },
};

function toBnDigits(num: number | string): string {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bn[parseInt(d, 10)] ?? d);
}

const OPTION_LABELS_BN = ["ক", "খ", "গ", "ঘ", "ঙ"];

interface DailyRunnerProps {
  questions: Question[];
  onComplete: (answers: AttemptAnswer[], durationSeconds: number) => Promise<void>;
  dateTitle?: string;
  onExit?: () => void;
}

export function DailyRunner({
  questions,
  onComplete,
  dateTitle,
  onExit,
}: DailyRunnerProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedExplanation, setCopiedExplanation] = useState(false);

  // Time tracking
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());
  const timePerQuestionRef = useRef<Record<string, number>>({});

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Keyboard navigation: 1,2,3,4 or A,B,C,D; ArrowLeft/Right
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable ||
        isSubmitting
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const keyMap: Record<string, number> = {
        "1": 0, "a": 0,
        "2": 1, "b": 1,
        "3": 2, "c": 2,
        "4": 3, "d": 3,
      };

      if (key in keyMap) {
        const optIdx = keyMap[key];
        if (currentQuestion && currentQuestion.options[optIdx]) {
          e.preventDefault();
          handleOptionSelect(currentQuestion.options[optIdx].id);
        }
        return;
      }

      if (e.key === "ArrowRight" || key === "n") {
        if (currentIndex < totalQuestions - 1) {
          e.preventDefault();
          handleIndexChange(currentIndex + 1);
        }
        return;
      }

      if (e.key === "ArrowLeft" || key === "p") {
        if (currentIndex > 0) {
          e.preventDefault();
          handleIndexChange(currentIndex - 1);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, totalQuestions, currentQuestion, isSubmitting, selectedAnswers]);

  // Check bookmark status
  useEffect(() => {
    async function checkCurrentBookmark() {
      if (!user || !currentQuestion) return;
      if (bookmarkedMap[currentQuestion.id] === undefined) {
        const isBm = await isQuestionBookmarked(user.uid, currentQuestion.id);
        setBookmarkedMap((prev) => ({ ...prev, [currentQuestion.id]: isBm }));
      }
    }
    checkCurrentBookmark();
  }, [currentQuestion, user, bookmarkedMap]);

  const handleIndexChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= totalQuestions || newIndex === currentIndex) return;

    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    timePerQuestionRef.current[currentQuestion.id] =
      (timePerQuestionRef.current[currentQuestion.id] || 0) + timeSpent;

    questionStartTimeRef.current = Date.now();
    setCurrentIndex(newIndex);
  };

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    // Don't allow changing answer once selected to enforce instant learning
    if (selectedAnswers[currentQuestion.id]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleToggleBookmark = async () => {
    if (!user || !currentQuestion) return;
    try {
      const newStatus = await toggleBookmark(user.uid, currentQuestion.id);
      setBookmarkedMap((prev) => ({ ...prev, [currentQuestion.id]: newStatus }));
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    timePerQuestionRef.current[currentQuestion.id] =
      (timePerQuestionRef.current[currentQuestion.id] || 0) + timeSpent;

    const totalDurationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    const attemptAnswers: AttemptAnswer[] = questions.map((q) => {
      const chosen = selectedAnswers[q.id] || null;
      const isCorrect = chosen === q.correctOptionId;
      return {
        questionId: q.id,
        selectedOptionId: chosen,
        correctOptionId: q.correctOptionId,
        isCorrect,
        timeSpentSeconds: timePerQuestionRef.current[q.id] || 0,
        tags: q.tags,
      };
    });

    try {
      await onComplete(attemptAnswers, totalDurationSeconds);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        আজকের কোনো প্রশ্ন পাওয়া যায়নি।
      </div>
    );
  }

  const currentSelectedOptionId = selectedAnswers[currentQuestion.id];
  const isCurrentAnswered = Boolean(currentSelectedOptionId);
  const isCurrentBookmarked = Boolean(bookmarkedMap[currentQuestion.id]);
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === totalQuestions;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const currentSubjectInfo =
    DAILY_SUBJECT_INFO[currentQuestion.subjectId] || {
      nameBn: "সাধারণ জ্ঞান",
      icon: "🎯",
      shortBn: "জিকে",
    };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* 5-Step Animated Stepper Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>দৈনিক ব্রেন টিজার (৫টি বিষয়)</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {toBnDigits(answeredCount)} / {toBnDigits(totalQuestions)} সম্পন্ন
          </span>
        </div>

        {/* The 5 Steps */}
        <div className="relative flex items-center justify-between">
          {/* Background Connector Bar */}
          <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 z-0" />

          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const chosen = selectedAnswers[q.id];
            const isAnswered = Boolean(chosen);
            const isCorrect = isAnswered && chosen === q.correctOptionId;
            const isWrong = isAnswered && !isCorrect;
            const sub = DAILY_SUBJECT_INFO[q.subjectId] || { shortBn: `প্রশ্ন ${idx + 1}` };

            return (
              <div
                key={q.id}
                onClick={() => handleIndexChange(idx)}
                className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                {/* Step Circle */}
                <div
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isCurrent
                      ? "ring-4 ring-indigo-500/20 bg-indigo-600 text-white shadow-xs scale-105"
                      : isCorrect
                      ? "bg-emerald-500 text-white shadow-xs"
                      : isWrong
                      ? "bg-rose-500 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {isCorrect ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : isWrong ? (
                    <X className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span>{toBnDigits(idx + 1)}</span>
                  )}
                </div>

                {/* Subject Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-medium transition-colors ${
                    isCurrent
                      ? "text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  }`}
                >
                  {sub.shortBn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Pillar Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
              <span>{currentSubjectInfo.icon}</span>
              <span>{currentSubjectInfo.nameBn}</span>
            </span>

            {/* BCS Source / Year Tag */}
            {currentQuestion.source && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                {currentQuestion.source}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          {user && (
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isCurrentBookmarked
                  ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5] dark:bg-[#312E81] dark:border-[#818CF8] dark:text-[#A5B4FC]"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              title={isCurrentBookmarked ? "বুকমার্ক সরান" : "বুকমার্ক করুন"}
            >
              <Bookmark className={`h-4 w-4 ${isCurrentBookmarked ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        {/* Question Prompt */}
        <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed pt-1">
          <span className="font-bold text-[#4F46E5] dark:text-[#818CF8] mr-2">
            প্রশ্ন {toBnDigits(currentIndex + 1)}.
          </span>
          <MathText text={currentQuestion.question} />
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-1">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = currentSelectedOptionId === option.id;
            const isCorrectOption = option.id === currentQuestion.correctOptionId;

            let containerStyle =
              "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200";
            let badgeStyle =
              "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";

            if (isCurrentAnswered) {
              if (isCorrectOption) {
                containerStyle =
                  "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500";
                badgeStyle = "bg-emerald-500 text-white font-bold";
              } else if (isSelected) {
                containerStyle =
                  "border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-1 ring-rose-400";
                badgeStyle = "bg-rose-500 text-white font-bold";
              } else {
                containerStyle = "opacity-50 border-slate-200 dark:border-slate-800";
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionSelect(option.id)}
                disabled={isCurrentAnswered}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-center gap-3.5 transition-all cursor-pointer ${containerStyle}`}
              >
                {/* Option Letter Badge (ক, খ, গ, ঘ) */}
                <span
                  className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 uppercase transition-colors ${badgeStyle}`}
                >
                  {OPTION_LABELS_BN[optIdx] || option.id}
                </span>

                {/* Option text */}
                <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                  <MathText text={option.text} />
                </div>

                {/* Instant Feedback Status Icon */}
                {isCurrentAnswered && (
                  <>
                    {isCorrectOption && (
                      <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}
                    {isSelected && !isCorrectOption && (
                      <div className="h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <X className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Mode Explanation Reveal */}
        {isCurrentAnswered && (
          <div className="p-4 sm:p-5 rounded-xl border-l-4 border-indigo-500 bg-slate-50 dark:bg-slate-900/60 border-y border-r border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 space-y-2 mt-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 font-bold text-indigo-700 dark:text-indigo-400">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>
                  {currentSelectedOptionId === currentQuestion.correctOptionId
                    ? "সঠিক উত্তর! চমৎকার প্রস্তুতি।"
                    : "ভুল উত্তর। সঠিক সমাধানটি জেনে নিন:"}
                </span>
              </div>
              {currentQuestion.explanation && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentQuestion.explanation || "");
                    setCopiedExplanation(true);
                    setTimeout(() => setCopiedExplanation(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="সমাধান কপি করুন"
                >
                  {copiedExplanation ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {currentQuestion.explanation ? (
              <div className="leading-relaxed pt-1 text-slate-700 dark:text-slate-300 whitespace-pre-line text-xs sm:text-[13px]">
                <MathText text={currentQuestion.explanation} />
              </div>
            ) : (
              <p className="text-slate-500 italic">এই প্রশ্নের জন্য কোনো অতিরিক্ত ব্যাখ্যা নেই।</p>
            )}
          </div>
        )}

        {/* Bottom Navigation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleIndexChange(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            পূর্ববর্তী
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!isAllAnswered || isSubmitting}
              className={`text-xs gap-1.5 font-bold shadow-xs cursor-pointer ${
                isAllAnswered
                  ? "bg-amber-600 hover:bg-amber-700 text-white animate-bounce-subtle"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              }`}
            >
              <Flame className="h-4 w-4 fill-current" />
              {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "ফলাফল ও স্ট্রিক সুরক্ষিত করুন"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              onClick={() => handleIndexChange(currentIndex + 1)}
              className="text-xs gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold cursor-pointer shadow-xs"
            >
              পরবর্তী প্রশ্ন
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
