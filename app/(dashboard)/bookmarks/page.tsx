"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question, Exam, Subject } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/context/language-context";
import {
  getUserBookmarksMap,
  toggleBookmark,
  saveBookmarkAnswer,
} from "@/lib/services/bookmark-service";
import { getUserRecordedAnswers } from "@/lib/services/attempt-service";
import { getQuestionsByIds } from "@/lib/services/question-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects } from "@/lib/services/subject-service";
import { StudyQuestionCard } from "@/components/question-bank/study-question-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bookmark,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";

export default function BookmarksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, n } = useLanguage();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userAnswersMap, setUserAnswersMap] = useState<Record<string, string>>({});
  const [globalRevealed, setGlobalRevealed] = useState(true);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

  useEffect(() => {
    async function loadBookmarks() {
      if (!user) return;
      setLoading(true);
      try {
        const [examList, subjectList, bookmarksMap, recordedAnswers] =
          await Promise.all([
            getExams(),
            getSubjects(),
            getUserBookmarksMap(user.uid),
            getUserRecordedAnswers(user.uid),
          ]);

        setExams(examList);
        setSubjects(subjectList);

        // Merge recorded answers from attempts and bookmark metadata
        const mergedAnswers: Record<string, string> = {};
        Object.entries(recordedAnswers).forEach(([qId, ans]) => {
          if (ans.selectedOptionId) {
            mergedAnswers[qId] = ans.selectedOptionId;
          }
        });
        Object.entries(bookmarksMap).forEach(([qId, meta]) => {
          if (meta.selectedOptionId && !mergedAnswers[qId]) {
            mergedAnswers[qId] = meta.selectedOptionId;
          }
        });
        setUserAnswersMap(mergedAnswers);

        const bookmarkIds = Object.keys(bookmarksMap);
        if (bookmarkIds.length > 0) {
          const loadedQuestions = await getQuestionsByIds(bookmarkIds);
          setQuestions(loadedQuestions);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBookmarks();
  }, [user]);

  const handleRemoveBookmark = async (qId: string) => {
    if (!user) return;
    try {
      await toggleBookmark(user.uid, qId);
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  const handleAnswerSelect = async (questionId: string, optionId: string) => {
    if (!user) return;
    setUserAnswersMap((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    await saveBookmarkAnswer(user.uid, questionId, optionId);
  };

  const handlePracticeQuestions = (targetQuestions: Question[]) => {
    if (targetQuestions.length === 0) return;
    const newSessionId = `bookmarks_${Date.now()}`;
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
    if (selectedSubjectId !== "all" && q.subjectId !== selectedSubjectId) return false;
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
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your Bookmarks...</p>
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
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8]">
              <Bookmark className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
              {t("সংরক্ষিত লাইব্রেরি", "Saved Library")}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("বুকমার্ক (সংরক্ষিত প্রশ্নাবলি)", "Bookmarks (Saved Questions)")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t(
              "আপনার অনুশীলন ও পরীক্ষার সময় চিহ্নিত করা প্রশ্নাবলি। প্রতিটি প্রশ্নের নিজস্ব উত্তর, সঠিক উত্তর এবং পূর্ণ ব্যাখ্যা দেখুন।",
              "Questions saved during your practice and mock exams. Review your recorded answers, correct options, and full explanations."
            )}
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
                <span>{t("উত্তর লুকান (স্ব-মূল্যায়ন)", "Hide Answers (Self-Test)")}</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t("সব উত্তর একবারে দেখান", "Reveal All Answers")}</span>
              </>
            )}
          </Button>

          {/* Practice All Bookmarks */}
          {questions.length > 0 && (
            <Button
              onClick={() => handlePracticeQuestions(filteredQuestions.length > 0 ? filteredQuestions : questions)}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 h-9 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t(`বুকমার্ক অনুশীলন করুন (${n(filteredQuestions.length)})`, `Practice Bookmarks (${filteredQuestions.length})`)}
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
              placeholder="প্রশ্ন বা বিষয় দিয়ে খুঁজুন (Search by question text or tag)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
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

            {/* Subject Filter */}
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Showing <strong className="text-slate-700 dark:text-slate-300">{filteredQuestions.length}</strong> of{" "}
            {questions.length} saved bookmarks
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            💡 অপশনে ক্লিক করে নিজের উত্তর যাচাই করুন
          </div>
        </div>
      </div>

      {/* 3. Bookmarks List with StudyQuestionCard */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {questions.length === 0
              ? "No Bookmarked Questions Yet"
              : "No Bookmarks Match Current Filter"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {questions.length === 0
              ? "প্রশ্ন ব্যাংক অথবা প্র্যাকটিস সেশনের সময় বুকমার্ক আইকনে ক্লিক করে প্রয়োজনীয় প্রশ্নাবলি এখানে সংরক্ষণ করতে পারেন।"
              : "অন্য কিওয়ার্ড অথবা বিষয় ফিল্টার পরিবর্তন করে দেখুন।"}
          </p>
          {questions.length === 0 && (
            <Button
              onClick={() => router.push("/question-bank")}
              size="sm"
              className="text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Go to Question Bank
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userAns = userAnswersMap[q.id] || null;

            return (
              <StudyQuestionCard
                key={q.id}
                index={idx}
                question={q}
                isBookmarked={true}
                onToggleBookmark={() => handleRemoveBookmark(q.id)}
                onRemove={() => handleRemoveBookmark(q.id)}
                removeTooltip="বুকমার্ক তালিকা থেকে সরান"
                subjectName={subjectMap.get(q.subjectId)}
                defaultRevealed={globalRevealed}
                initialSelectedOptionId={userAns}
                onAnswerSelect={(optId) => handleAnswerSelect(q.id, optId)}
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
