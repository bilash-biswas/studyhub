"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Attempt, Question, Exam, Subject } from "@/types";
import { getAttemptById } from "@/lib/services/attempt-service";
import { getQuestionsByIds } from "@/lib/services/question-service";
import { getExamById } from "@/lib/services/exam-service";
import { getSubjectById } from "@/lib/services/subject-service";
import {
  getUserBookmarkIds,
  toggleBookmark,
} from "@/lib/services/bookmark-service";
import { useAuth } from "@/hooks/useAuth";
import { ScoreSummaryCard } from "@/components/results/score-summary-card";
import { QuestionReviewItem } from "@/components/results/question-review-item";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
} from "lucide-react";

export default function AttemptResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question>>({});
  const [exam, setExam] = useState<Exam | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter tab: "all" | "wrong" | "correct" | "skipped"
  const [filterTab, setFilterTab] = useState<"all" | "wrong" | "correct" | "skipped">("all");

  useEffect(() => {
    async function loadAttemptData() {
      if (!attemptId) return;
      setLoading(true);
      try {
        const att = await getAttemptById(attemptId);
        if (!att) {
          setErrorMsg("Attempt record not found.");
          return;
        }

        setAttempt(att);

        // Fetch Exam and Subject metadata
        if (att.examId) {
          getExamById(att.examId).then(setExam).catch(console.error);
        }
        if (att.subjectId) {
          getSubjectById(att.subjectId).then(setSubject).catch(console.error);
        }

        // Fetch question objects
        const questionIds = att.answers.map((a) => a.questionId);
        if (questionIds.length > 0) {
          const qs = await getQuestionsByIds(questionIds);
          const map: Record<string, Question> = {};
          qs.forEach((q) => {
            map[q.id] = q;
          });
          setQuestionsMap(map);
        }

        // Fetch user's bookmarks
        if (user) {
          const bms = await getUserBookmarkIds(user.uid);
          setBookmarkedIds(new Set(bms));
        }
      } catch (err: any) {
        console.error("Error loading attempt results:", err);
        setErrorMsg(err?.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    }

    loadAttemptData();
  }, [attemptId, user]);

  const handleToggleBookmark = async (qId: string) => {
    if (!user) return;
    try {
      const isNowBookmarked = await toggleBookmark(user.uid, qId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isNowBookmarked) {
          next.add(qId);
        } else {
          next.delete(qId);
        }
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  // Launch a targeted practice session with only the incorrectly answered questions
  const handlePracticeMistakes = () => {
    if (!attempt) return;
    const mistakeQuestionIds = attempt.answers
      .filter((a) => !a.isCorrect && !!a.selectedOptionId)
      .map((a) => a.questionId);

    if (mistakeQuestionIds.length === 0) return;

    const newSessionId = `mistakes_${Date.now()}`;
    const config = {
      examId: attempt.examId,
      subjectId: attempt.subjectId,
      questionIds: mistakeQuestionIds,
      count: mistakeQuestionIds.length,
      feedbackMode: "instant",
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`session_${newSessionId}`, JSON.stringify(config));
    }
    router.push(`/practice/${newSessionId}`);
  };

  // Launch a fresh session with same parameters
  const handleRetakeSession = () => {
    if (!attempt) return;
    const newSessionId = `retake_${Date.now()}`;
    const config = {
      examId: attempt.examId,
      subjectId: attempt.subjectId,
      difficulty: "all",
      count: attempt.totalQuestions,
      feedbackMode: attempt.mode === "exam" ? "exam" : "instant",
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`session_${newSessionId}`, JSON.stringify(config));
    }
    router.push(`/practice/${newSessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Generating performance report & solutions...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !attempt) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center">
          <XCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">Results Not Found</h2>
        <p className="text-xs text-slate-500">{errorMsg || "Unable to retrieve this attempt record."}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/practice")}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Practice
        </Button>
      </div>
    );
  }

  // Filter questions for detailed review
  const filteredAnswers = attempt.answers.filter((ans) => {
    if (filterTab === "wrong") return !ans.isCorrect && !!ans.selectedOptionId;
    if (filterTab === "correct") return ans.isCorrect;
    if (filterTab === "skipped") return !ans.selectedOptionId;
    return true;
  });

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/practice")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Practice Setup
        </button>

        <span className="text-xs text-slate-500">
          Attempt ID: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">{attempt.id.slice(0, 8)}</code>
        </span>
      </div>

      {/* Main Score Summary Card */}
      <ScoreSummaryCard
        attempt={attempt}
        examTitle={exam?.name}
        subjectTitle={subject?.name}
      />

      {/* Action Buttons Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {attempt.wrongAnswers > 0 && (
            <Button
              size="sm"
              onClick={handlePracticeMistakes}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shadow-xs"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Practice Mistakes ({attempt.wrongAnswers})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRetakeSession}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retake Session
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/practice")}
            className="text-xs gap-1.5 text-slate-600 dark:text-slate-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#4F46E5] dark:text-[#818CF8]" />
            New Practice
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-xs gap-1.5 text-slate-600 dark:text-slate-300"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="space-y-4">
        {/* Section Header & Review Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Detailed Question Review
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review answers, solutions, and mathematical step-by-step explanations.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterTab === "all"
                  ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              All ({attempt.totalQuestions})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("wrong")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                filterTab === "wrong"
                  ? "bg-white dark:bg-[#111827] text-red-600 dark:text-red-400 shadow-xs"
                  : "text-slate-500 hover:text-red-600"
              }`}
            >
              <XCircle className="h-3 w-3" />
              Mistakes ({attempt.wrongAnswers})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("correct")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                filterTab === "correct"
                  ? "bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-emerald-600"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Correct ({attempt.correctAnswers})
            </button>

            {attempt.skippedQuestions > 0 && (
              <button
                type="button"
                onClick={() => setFilterTab("skipped")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                  filterTab === "skipped"
                    ? "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <HelpCircle className="h-3 w-3" />
                Skipped ({attempt.skippedQuestions})
              </button>
            )}
          </div>
        </div>

        {/* Filtered Question Review List */}
        {filteredAnswers.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 text-xs">
            No questions match the selected filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnswers.map((ans, idx) => {
              const question = questionsMap[ans.questionId];
              if (!question) {
                return (
                  <div
                    key={ans.questionId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs text-slate-500"
                  >
                    Question ID: {ans.questionId} (Data unavailable)
                  </div>
                );
              }

              // Original index in the attempt
              const originalIndex = attempt.answers.findIndex(
                (a) => a.questionId === ans.questionId
              );

              return (
                <QuestionReviewItem
                  key={ans.questionId}
                  index={originalIndex >= 0 ? originalIndex : idx}
                  question={question}
                  attemptAnswer={ans}
                  isBookmarked={bookmarkedIds.has(question.id)}
                  onToggleBookmark={handleToggleBookmark}
                  wrongMark={attempt.wrongMark}
                  correctMark={attempt.correctMark}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
