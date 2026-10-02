"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Send,
  HelpCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { Question, AttemptAnswer } from "@/types";
import { MathText } from "@/components/ui/math-text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toggleBookmark, isQuestionBookmarked } from "@/lib/services/bookmark-service";
import {
  getOptionContainerStyles,
  getOptionBadgeStyles,
  getPaletteButtonStyles,
  OptionState,
  PaletteState,
} from "@/lib/mcq-styles";

interface QuestionRunnerProps {
  questions: Question[];
  feedbackMode: "instant" | "exam";
  onComplete: (answers: AttemptAnswer[], durationSeconds: number) => Promise<void>;
  examTitle?: string;
  subjectTitle?: string;
  onExit?: () => void;
}

export function QuestionRunner({
  questions,
  feedbackMode,
  onComplete,
  examTitle,
  subjectTitle,
  onExit,
}: QuestionRunnerProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Time tracking
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());
  const timePerQuestionRef = useRef<Record<string, number>>({});

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Check bookmark status for current question
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

  // Record time spent on previous question when switching
  const handleIndexChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= totalQuestions || newIndex === currentIndex) return;

    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    timePerQuestionRef.current[currentQuestion.id] =
      (timePerQuestionRef.current[currentQuestion.id] || 0) + timeSpent;

    questionStartTimeRef.current = Date.now();
    setCurrentIndex(newIndex);
  };

  // Option Click Handler
  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;

    // In instant mode, if already answered, don't allow changing to enforce learning
    if (feedbackMode === "instant" && selectedAnswers[currentQuestion.id]) {
      return;
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  // Clear Selection
  const handleClearSelection = () => {
    if (feedbackMode === "instant") return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  // Toggle Review Flag
  const handleToggleMark = () => {
    setMarkedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!user || !currentQuestion) return;
    try {
      const newStatus = await toggleBookmark(user.uid, currentQuestion.id);
      setBookmarkedMap((prev) => ({
        ...prev,
        [currentQuestion.id]: newStatus,
      }));
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  // Calculate final payload and submit
  const handleSubmitSession = async () => {
    setIsSubmitting(true);
    // Record time for last question
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

    await onComplete(attemptAnswers, totalDurationSeconds);
    setIsSubmitting(false);
  };

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        No questions available for this practice session.
      </div>
    );
  }

  // Answer state for current question
  const currentSelectedOptionId = selectedAnswers[currentQuestion.id];
  const isCurrentAnswered = Boolean(currentSelectedOptionId);
  const isCurrentMarked = Boolean(markedQuestions[currentQuestion.id]);
  const isCurrentBookmarked = Boolean(bookmarkedMap[currentQuestion.id]);

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              {examTitle && (
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {examTitle}
                </span>
              )}
              {subjectTitle && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 dark:text-slate-400">{subjectTitle}</span>
                </>
              )}
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] font-medium capitalize">
                {feedbackMode === "instant" ? "Instant Feedback" : "Exam Mode"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Question {currentIndex + 1} of {totalQuestions} ({answeredCount} answered)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                isCurrentBookmarked
                  ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5] dark:bg-[#312E81] dark:border-[#818CF8] dark:text-[#A5B4FC]"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              title={isCurrentBookmarked ? "Remove Bookmark" : "Bookmark Question"}
            >
              <Bookmark className={`h-4 w-4 ${isCurrentBookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">
                {isCurrentBookmarked ? "Bookmarked" : "Bookmark"}
              </span>
            </button>

            {/* Submit Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="text-xs gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Practice
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-[#4F46E5] dark:bg-[#818CF8] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Runner Grid (Question Arena + Palette) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 sm:p-6 shadow-xs space-y-5">
            {/* Question Badges */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Question {currentIndex + 1}
              </span>
              <div className="flex items-center gap-2">
                <span className="capitalize">{currentQuestion.difficulty}</span>
                {currentQuestion.year && <span>({currentQuestion.year})</span>}
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
              <MathText text={currentQuestion.question} />
            </div>

            {/* Optional Image */}
            {currentQuestion.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-2">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question Diagram"
                  className="max-h-60 object-contain"
                />
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((option) => {
                const isSelected = currentSelectedOptionId === option.id;
                let optionState: OptionState = "normal";

                if (feedbackMode === "instant" && isCurrentAnswered) {
                  if (option.id === currentQuestion.correctOptionId) {
                    optionState = "correct";
                  } else if (isSelected) {
                    optionState = "wrong";
                  }
                } else if (isSelected) {
                  optionState = "selected";
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionSelect(option.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${getOptionContainerStyles(
                      optionState
                    )}`}
                  >
                    {/* Option letter badge */}
                    <span
                      className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 uppercase transition-colors ${getOptionBadgeStyles(
                        optionState
                      )}`}
                    >
                      {option.id}
                    </span>

                    {/* Option text */}
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                      <MathText text={option.text} />
                    </div>

                    {/* Indicator Icon for Instant Mode */}
                    {feedbackMode === "instant" && isCurrentAnswered && (
                      <>
                        {option.id === currentQuestion.correctOptionId && (
                          <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        {isSelected && option.id !== currentQuestion.correctOptionId && (
                          <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                            <X className="h-4 w-4" />
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Mode Explanation Reveal */}
            {feedbackMode === "instant" && isCurrentAnswered && (
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-800 dark:text-slate-200 space-y-2 mt-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {currentSelectedOptionId === currentQuestion.correctOptionId
                      ? "Correct Answer! চমৎকার!"
                      : "Incorrect. সঠিক উত্তর পর্যালোচনা করুন:"}
                  </span>
                </div>
                {currentQuestion.explanation ? (
                  <div className="leading-relaxed pt-1">
                    <MathText text={currentQuestion.explanation} />
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No explanation provided for this question.</p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIndexChange(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="text-xs gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleMark}
                className={`text-xs gap-1 ${
                  isCurrentMarked
                    ? "border-[#F59E0B] text-[#B45309] bg-[#FFFBEB] dark:bg-[#451A03] dark:text-[#FCD34D]"
                    : ""
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {isCurrentMarked ? "Marked" : "Mark for Review"}
              </Button>

              {isCurrentAnswered && feedbackMode === "exam" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-xs text-slate-500 gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>

            <div>
              {currentIndex < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleIndexChange(currentIndex + 1)}
                  className="text-xs gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowConfirmModal(true)}
                  className="text-xs gap-1"
                >
                  Submit Practice
                  <Send className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (1 Col) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Question Palette</span>
              <span className="text-[11px] font-normal text-slate-500">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            {/* Palette Buttons Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(selectedAnswers[q.id]);
                const isMarked = Boolean(markedQuestions[q.id]);

                let paletteState: PaletteState = "unanswered";
                if (isCurrent) {
                  paletteState = "current";
                } else if (isMarked) {
                  paletteState = "marked";
                } else if (isAnswered) {
                  paletteState = "answered";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleIndexChange(idx)}
                    className={`h-8 rounded-lg text-xs border flex items-center justify-center transition-colors cursor-pointer ${getPaletteButtonStyles(
                      paletteState
                    )}`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#4F46E5] dark:bg-[#818CF8]" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#EEF2FF] border border-[#4F46E5] dark:bg-[#312E81] dark:border-[#818CF8]" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#FFFBEB] border border-[#F59E0B] dark:bg-[#451A03] dark:border-[#FBBF24]" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm border border-slate-300 dark:border-slate-700" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Submit Practice Session?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to finish this practice session and view your performance analytics?
            </p>

            <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <span className="text-[10px] text-slate-500 block">Answered</span>
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{answeredCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <span className="text-[10px] text-slate-500 block">Marked</span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {Object.values(markedQuestions).filter(Boolean).length}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Skipped</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {totalQuestions - answeredCount}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Continue Practice
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitSession}
                isLoading={isSubmitting}
                className="text-xs"
              >
                Yes, Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
