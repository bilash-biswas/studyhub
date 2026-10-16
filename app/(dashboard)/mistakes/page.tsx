"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question, Exam, Subject } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserMistakeQuestionIds,
  removeMistake,
} from "@/lib/services/analytics-service";
import { getUserRecordedAnswers } from "@/lib/services/attempt-service";
import { getQuestionsByIds } from "@/lib/services/question-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects } from "@/lib/services/subject-service";
import {
  getUserBookmarkIds,
  toggleBookmark,
} from "@/lib/services/bookmark-service";
import { StudyQuestionCard } from "@/components/question-bank/study-question-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";

export default function MistakeBankPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [userAnswersMap, setUserAnswersMap] = useState<Record<string, string>>({});
  const [globalRevealed, setGlobalRevealed] = useState(true);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  useEffect(() => {
    async function loadMistakes() {
      if (!user) return;
      setLoading(true);
      try {
        const [examList, subjectList, mistakeIds, bookmarkIds, recordedAnswers] =
          await Promise.all([
            getExams(),
            getSubjects(),
            getUserMistakeQuestionIds(user.uid),
            getUserBookmarkIds(user.uid),
            getUserRecordedAnswers(user.uid),
          ]);

        setExams(examList);
        setSubjects(subjectList);
        setBookmarkedIds(new Set(bookmarkIds));

        const answersMap: Record<string, string> = {};
        Object.entries(recordedAnswers).forEach(([qId, ans]) => {
          if (ans.selectedOptionId) {
            answersMap[qId] = ans.selectedOptionId;
          }
        });
        setUserAnswersMap(answersMap);

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
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Active Recall
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Mistake Bank (ভুল প্রশ্নাবলি)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            যেসব প্রশ্নে আপনার ভুল উত্তর হয়েছিল সেগুলোর নিজস্ব রেকর্ড, সঠিক উত্তর ও পূর্ণ সমাধান।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Global Reveal / Hide Answer Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGlobalRevealed((prev) => !prev)}
            className="text-xs gap-1.5 h-9 border-slate-200 dark:border-slate-750"
          >
            {globalRevealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                <span>উত্তর লুকান (অনুশীলন)</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>সব উত্তর একবারে দেখান</span>
              </>
            )}
          </Button>

          {/* Practice All Mistakes */}
          {questions.length > 0 && (
            <Button
              onClick={() => handlePracticeQuestions(filteredQuestions.length > 0 ? filteredQuestions : questions)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 h-9 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Drill Mistakes ({filteredQuestions.length})
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="ভুল প্রশ্নের টেক্সট বা বিষয় দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
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

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy (সহজ)</option>
              <option value="medium">Medium (মধ্যম)</option>
              <option value="hard">Hard (কঠিন)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Showing <strong className="text-slate-700 dark:text-slate-300">{filteredQuestions.length}</strong> of{" "}
            {questions.length} saved mistakes
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            💡 ভুলগুলো পুনরায় অনুশীলন করে সমাধান নিশ্চিত করুন
          </div>
        </div>
      </div>

      {/* 3. Mistakes List with StudyQuestionCard */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {questions.length === 0
              ? "Zero Mistakes Recorded!"
              : "No Mistakes Match Current Filters"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {questions.length === 0
              ? "অভিনন্দন! আপনার অনুশীলনে কোনো ভুল সংরক্ষিত নেই। পরীক্ষা ও প্র্যাকটিসে কোনো প্রশ্ন ভুল হলে স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।"
              : "অন্য সার্চ ফিল্টার ব্যবহার করে দেখুন।"}
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
            const userAns = userAnswersMap[q.id] || null;

            return (
              <StudyQuestionCard
                key={q.id}
                index={idx}
                question={q}
                isBookmarked={isBookmarked}
                onToggleBookmark={() => handleToggleBookmark(q.id)}
                onRemove={() => handleRemoveMistake(q.id)}
                removeTooltip="ভুল ব্যাংক থেকে সরান"
                subjectName={subjectMap.get(q.subjectId)}
                defaultRevealed={globalRevealed}
                initialSelectedOptionId={userAns}
                showPracticeSingle={true}
                onPracticeSingle={(targetQ) => handlePracticeQuestions([targetQ])}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
