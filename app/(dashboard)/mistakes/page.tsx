"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question, Exam, Subject } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserMistakeQuestionIds,
  removeMistake,
} from "@/lib/services/analytics-service";
import { getQuestionsByIds } from "@/lib/services/question-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects } from "@/lib/services/subject-service";
import {
  getUserBookmarkIds,
  toggleBookmark,
} from "@/lib/services/bookmark-service";
import { MathText } from "@/components/ui/math-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Sparkles,
  Search,
  Bookmark,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lightbulb,
  Filter,
} from "lucide-react";

export default function MistakeBankPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(
    new Set()
  );

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  useEffect(() => {
    async function loadMistakes() {
      if (!user) return;
      setLoading(true);
      try {
        const [examList, subjectList, mistakeIds, bookmarkIds] =
          await Promise.all([
            getExams(),
            getSubjects(),
            getUserMistakeQuestionIds(user.uid),
            getUserBookmarkIds(user.uid),
          ]);

        setExams(examList);
        setSubjects(subjectList);
        setBookmarkedIds(new Set(bookmarkIds));

        if (mistakeIds.length > 0) {
          const loadedQuestions = await getQuestionsByIds(mistakeIds);
          setQuestions(loadedQuestions);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error loading mistake bank:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMistakes();
  }, [user]);

  const handleToggleBookmark = async (qId: string) => {
    if (!user) return;
    try {
      const isBookmarked = await toggleBookmark(user.uid, qId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isBookmarked) next.add(qId);
        else next.delete(qId);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const handleRemoveMistake = async (qId: string) => {
    if (!user) return;
    try {
      await removeMistake(user.uid, qId);
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch (err) {
      console.error("Failed to remove mistake:", err);
    }
  };

  const toggleExplanation = (qId: string) => {
    setExpandedExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Launch practice session with mistake questions
  const handlePracticeQuestions = (targetQuestions: Question[]) => {
    if (targetQuestions.length === 0) return;
    const newSessionId = `mistakes_${Date.now()}`;
    const config = {
      questionIds: targetQuestions.map((q) => q.id),
      count: targetQuestions.length,
      feedbackMode: "instant",
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`session_${newSessionId}`, JSON.stringify(config));
    }
    router.push(`/practice/${newSessionId}`);
  };

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    if (selectedExamId !== "all" && q.examId !== selectedExamId) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty)
      return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesText = q.question.toLowerCase().includes(query);
      const matchesTags = q.tags?.some((t) => t.toLowerCase().includes(query));
      if (!matchesText && !matchesTags) return false;
    }
    return true;
  });

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your Mistake Bank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Targeted Correction
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Mistake Bank (ভুল উত্তরের ব্যাংক)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Questions you previously answered incorrectly. Practicing your mistakes is the fastest way to improve your exam scores.
          </p>
        </div>

        {questions.length > 0 && (
          <Button
            onClick={() => handlePracticeQuestions(filteredQuestions.length > 0 ? filteredQuestions : questions)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shrink-0 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Practice Mistakes ({filteredQuestions.length})
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by question text or tag (e.g. algebra, মুক্তিযুদ্ধ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Exam Filter */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Exams</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Count Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-700 dark:text-slate-300">{filteredQuestions.length}</strong> of{" "}
            {questions.length} saved mistakes
          </span>
          {questions.length > 0 && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Solve and answer correctly to clear from bank
            </span>
          )}
        </div>
      </div>

      {/* Mistakes List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {questions.length === 0
              ? "Zero Mistakes Recorded!"
              : "No Mistakes Match Current Filters"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {questions.length === 0
              ? "Outstanding performance! As you practice questions, any errors you make will be saved here for focused drill."
              : "Try adjusting your search query or exam filter to find questions."}
          </p>
          {questions.length === 0 && (
            <Button
              onClick={() => router.push("/practice")}
              size="sm"
              className="text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Start Practice Session
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isBookmarked = bookmarkedIds.has(q.id);
            const isExplanationOpen = expandedExplanations.has(q.id);
            const correctOpt = q.options.find(
              (o) => o.id === q.correctOptionId
            );

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#111827] rounded-xl border border-amber-200/70 dark:border-amber-950/70 shadow-xs overflow-hidden"
              >
                {/* Item Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-amber-50/30 dark:bg-amber-950/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-700 dark:text-amber-400">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {subjectMap.get(q.subjectId) || "Subject"}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        q.difficulty === "easy"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : q.difficulty === "medium"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bookmark */}
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(q.id)}
                      title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        isBookmarked
                          ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400"
                          : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 ${
                          isBookmarked ? "fill-current" : ""
                        }`}
                      />
                    </button>

                    {/* Remove from Mistake Bank */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMistake(q.id)}
                      title="Remove from Mistake Bank"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-5 space-y-3">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                    <MathText text={q.question} />
                  </div>

                  {q.imageUrl && (
                    <div className="relative max-w-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img
                        src={q.imageUrl}
                        alt="Question illustration"
                        className="max-h-56 object-contain"
                      />
                    </div>
                  )}

                  {/* Correct Option Display */}
                  {correctOpt && (
                    <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-950/70 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-2.5 text-xs text-emerald-950 dark:text-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-emerald-800 dark:text-emerald-300">
                          Correct Answer ({q.correctOptionId.toUpperCase()}):
                        </strong>{" "}
                        <span className="font-medium">
                          <MathText text={correctOpt.text} />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Solution Accordion */}
                  {q.explanation && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleExplanation(q.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#4F46E5] transition-colors"
                      >
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                        <span>Step-by-Step Solution</span>
                        {isExplanationOpen ? (
                          <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                        )}
                      </button>

                      {isExplanationOpen && (
                        <div className="mt-2 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <MathText text={q.explanation} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Action and Tags */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex flex-wrap gap-1">
                      {q.tags?.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePracticeQuestions([q])}
                      className="text-xs h-7 gap-1"
                    >
                      <Sparkles className="h-3 w-3 text-[#4F46E5]" />
                      Practice Single
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
