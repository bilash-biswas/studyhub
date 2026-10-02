"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Timer as TimerIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Send,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { MockTest, Question, AttemptAnswer } from "@/types";
import { MathText } from "@/components/ui/math-text";
import { Button } from "@/components/ui/button";
import { calculateExamTimer, formatTimer } from "@/lib/calculations/timer";

interface ExamRunnerProps {
  test: MockTest;
  questions: Question[];
  onComplete: (answers: AttemptAnswer[], durationSeconds: number) => Promise<void>;
  onExit?: () => void;
}

export function ExamRunner({
  test,
  questions,
  onComplete,
  onExit,
}: ExamRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);

  // Server-anchored or persistent startedAt timestamp
  const durationSeconds = test.durationMinutes * 60;
  const [startedAtMs, setStartedAtMs] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`exam_start_${test.id}`);
      if (stored) {
        const val = Number(stored);
        if (!isNaN(val) && val > 0 && Date.now() - val < durationSeconds * 1000) {
          return val;
        }
      }
      const now = Date.now();
      sessionStorage.setItem(`exam_start_${test.id}`, String(now));
      return now;
    }
    return Date.now();
  });

  const [remainingSecs, setRemainingSecs] = useState<number>(durationSeconds);
  const [isWarning, setIsWarning] = useState<boolean>(false);

  // Time spent per question
  const questionStartTimeRef = useRef<number>(Date.now());
  const timePerQuestionRef = useRef<Record<string, number>>({});
  const autoSubmittedRef = useRef<boolean>(false);

  const currentQuestion = questions[currentIndex];

  // Helper to record question time on index switch
  const recordQuestionTime = () => {
    if (!currentQuestion) return;
    const now = Date.now();
    const elapsed = Math.round((now - questionStartTimeRef.current) / 1000);
    timePerQuestionRef.current[currentQuestion.id] =
      (timePerQuestionRef.current[currentQuestion.id] || 0) + elapsed;
    questionStartTimeRef.current = now;
  };

  // Timer Tick & Auto-Submit on expiration
  useEffect(() => {
    const interval = setInterval(() => {
      const timerStatus = calculateExamTimer({
        startedAtMs,
        durationSeconds,
        nowMs: Date.now(),
      });

      setRemainingSecs(timerStatus.remainingSeconds);
      setIsWarning(timerStatus.isWarning);

      if (timerStatus.isExpired && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        clearInterval(interval);
        handleFinalSubmit(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAtMs, durationSeconds]);

  const handleSelectOption = (optionId: string) => {
    if (isSubmitting) return;
    setSelectedAnswers((prev) => {
      const current = prev[currentQuestion.id];
      if (current === optionId) {
        // Toggle unselect
        const next = { ...prev };
        delete next[currentQuestion.id];
        return next;
      }
      return { ...prev, [currentQuestion.id]: optionId };
    });
  };

  const handleClearAnswer = () => {
    if (isSubmitting) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  const handleToggleReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleNavigate = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length || isSubmitting) return;
    recordQuestionTime();
    setCurrentIndex(newIndex);
  };

  const handleFinalSubmit = async (isAutoExpire = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    recordQuestionTime();

    const totalExamDurationSeconds = Math.round((Date.now() - startedAtMs) / 1000);

    // Build AttemptAnswer[]
    const answers: AttemptAnswer[] = questions.map((q) => {
      const chosenOptId = selectedAnswers[q.id] || null;
      const isCorrect = chosenOptId === q.correctOptionId;
      const timeSpent = timePerQuestionRef.current[q.id] || 0;

      return {
        questionId: q.id,
        selectedOptionId: chosenOptId,
        correctOptionId: q.correctOptionId,
        isCorrect,
        timeSpentSeconds: timeSpent,
        tags: q.tags || [],
      };
    });

    // Clear session timer storage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`exam_start_${test.id}`);
    }

    try {
      await onComplete(answers, totalExamDurationSeconds);
    } catch (err) {
      console.error("Failed to complete exam:", err);
      setIsSubmitting(false);
    }
  };

  // Stats calculation
  const totalCount = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalCount - answeredCount;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between gap-4">
        {/* Left: Title & Progress */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                Mock Exam
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {currentIndex + 1} of {totalCount}
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
              {test.title}
            </h1>
          </div>
        </div>

        {/* Center: Live Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wider transition-all ${
            isWarning
              ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900 animate-pulse"
              : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
          }`}
        >
          <TimerIcon className="h-4 w-4" />
          <span>{formatTimer(remainingSecs)}</span>
        </div>

        {/* Right: Submit Button & Palette Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaletteDrawerOpen(!paletteDrawerOpen)}
            className="text-xs gap-1 h-8 md:hidden"
          >
            <Menu className="h-3.5 w-3.5" />
            Palette
          </Button>

          <Button
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            disabled={isSubmitting}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 h-8 px-3.5 shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Examination View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Question Area (3 Cols) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
            {/* Question Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#4F46E5] dark:text-[#818CF8]">
                  Question {currentIndex + 1}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    currentQuestion.difficulty === "easy"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : currentQuestion.difficulty === "medium"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              {/* Mark for Review Toggle */}
              <button
                type="button"
                onClick={handleToggleReview}
                className={`text-xs font-medium px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  markedForReview[currentQuestion.id]
                    ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300"
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                <Flag
                  className={`h-3 w-3 ${
                    markedForReview[currentQuestion.id] ? "fill-current" : ""
                  }`}
                />
                <span>
                  {markedForReview[currentQuestion.id]
                    ? "Marked for Review"
                    : "Mark for Review"}
                </span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
              <MathText text={currentQuestion.question} />
            </div>

            {/* Optional Image */}
            {currentQuestion.imageUrl && (
              <div className="relative max-w-md rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="max-h-60 object-contain mx-auto"
                />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                const letter = optionLetters[optIdx] || `${optIdx + 1}`;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "border-[#4F46E5] bg-indigo-50/70 text-slate-900 dark:bg-indigo-950/40 dark:text-slate-100 ring-2 ring-[#4F46E5]/40"
                        : "border-slate-200 hover:border-slate-300 bg-white dark:bg-[#111827] dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-[#4F46E5] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {letter}
                    </span>
                    <div className="text-sm font-normal pt-0.5 leading-snug flex-1">
                      <MathText text={opt.text} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Question Action Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAnswer}
                disabled={!selectedAnswers[currentQuestion.id]}
                className="text-xs text-slate-500 hover:text-red-600 gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Clear Response
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="text-xs gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => handleNavigate(currentIndex + 1)}
                    className="text-xs gap-1 bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowConfirmModal(true)}
                    className="text-xs gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Review & Submit
                    <Send className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (1 Col on Desktop, Drawer on Mobile) */}
        <div
          className={`md:col-span-1 space-y-4 ${
            paletteDrawerOpen
              ? "fixed inset-0 z-50 bg-white dark:bg-[#111827] p-6 overflow-y-auto block md:static md:p-0 md:bg-transparent"
              : "hidden md:block"
          }`}
        >
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Question Palette
              </h2>
              {paletteDrawerOpen && (
                <button
                  type="button"
                  onClick={() => setPaletteDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 md:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4F46E5]" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Skipped ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Marked ({reviewCount})</span>
              </div>
            </div>

            {/* Bubble Grid */}
            <div className="grid grid-cols-5 gap-1.5 pt-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!selectedAnswers[q.id];
                const isMarked = !!markedForReview[q.id];

                let bubbleStyles =
                  "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

                if (isAnswered && isMarked) {
                  bubbleStyles =
                    "bg-purple-600 text-white border-purple-700 font-bold";
                } else if (isAnswered) {
                  bubbleStyles =
                    "bg-[#4F46E5] text-white border-[#4F46E5] font-bold";
                } else if (isMarked) {
                  bubbleStyles =
                    "bg-amber-500 text-white border-amber-600 font-bold";
                }

                if (isCurrent) {
                  bubbleStyles += " ring-2 ring-indigo-500 ring-offset-1";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      handleNavigate(idx);
                      setPaletteDrawerOpen(false);
                    }}
                    className={`h-8 rounded-lg border text-xs font-medium flex items-center justify-center transition-all ${bubbleStyles}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Ready to Submit Exam?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your responses will be evaluated and recorded immediately.
                </p>
              </div>
            </div>

            {/* Summary Counts */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center text-xs">
              <div>
                <div className="font-bold text-base text-[#4F46E5]">
                  {answeredCount}
                </div>
                <div className="text-slate-500">Answered</div>
              </div>
              <div>
                <div className="font-bold text-base text-slate-700 dark:text-slate-300">
                  {unansweredCount}
                </div>
                <div className="text-slate-500">Unanswered</div>
              </div>
              <div>
                <div className="font-bold text-base text-amber-600">
                  {reviewCount}
                </div>
                <div className="text-slate-500">Flagged</div>
              </div>
            </div>

            {/* Negative Marking Warning */}
            {test.wrongMark > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Negative marking is enabled: <strong>-{test.wrongMark}</strong> per incorrect answer.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Return to Exam
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleFinalSubmit(false);
                }}
                disabled={isSubmitting}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
