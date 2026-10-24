"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Question, Exam, Subject } from "@/types";
import {
  getQuestions,
  getSubjectQuestionCounts,
  QuestionFilters,
} from "@/lib/services/question-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjectsByExamId } from "@/lib/services/subject-service";
import { toggleBookmark, getUserBookmarkIds } from "@/lib/services/bookmark-service";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/context/language-context";
import { BCS_BATCHES } from "@/lib/constants/bcs-batches";
import { StudyQuestionCard } from "@/components/question-bank/study-question-card";
import { Button } from "@/components/ui/button";
import { DocumentSnapshot } from "firebase/firestore";
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";

export default function QuestionBankStudyPage() {
  const { user } = useAuth();
  const { lang, t, n } = useLanguage();

  // Core Data State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedExamId, setSelectedExamId] = useState<string>("exam_bcs");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedBatchTag, setSelectedBatchTag] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedVerified, setSelectedVerified] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Default state: Answers are hidden until clicked on each card, with a master switch
  const [autoRevealAll, setAutoRevealAll] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pageDocSnapshots, setPageDocSnapshots] = useState<DocumentSnapshot[]>([]);
  const pageSize = 20;

  // 1. Initial Load: Fetch Exams & Bookmarks
  useEffect(() => {
    async function init() {
      try {
        const examList = await getExams();
        setExams(examList);
        if (examList.length > 0 && !selectedExamId) {
          setSelectedExamId(examList[0].id);
        }

        if (user) {
          const bIds = await getUserBookmarkIds(user.uid);
          setBookmarkedIds(new Set(bIds));
        }
      } catch (err) {
        console.error("Error initializing question bank:", err);
      }
    }
    init();
  }, [user]);

  // 2. Load Subjects & Live Question Counts when Exam changes
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedExamId) return;
      try {
        const subs = await getSubjectsByExamId(selectedExamId);
        setSubjects(subs);
        setSelectedSubjectId(""); // reset subject

        if (subs.length > 0) {
          const counts = await getSubjectQuestionCounts(subs.map((s) => s.id));
          setSubjectCounts(counts);
        } else {
          setSubjectCounts({});
        }
      } catch (err) {
        console.error("Error loading subjects:", err);
      }
    }
    loadSubjects();
  }, [selectedExamId]);

  const totalExamQuestionCount = useMemo(() => {
    return Object.values(subjectCounts).reduce((acc, c) => acc + c, 0);
  }, [subjectCounts]);

  // 3. Subject Name Lookup Map
  const subjectMap = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [subjects]);

  // 4. Fetch Questions Callback with Pagination
  const fetchQuestionsForPage = useCallback(
    async (page: number, lastDoc: DocumentSnapshot | null = null) => {
      setLoading(true);
      try {
        const filters: QuestionFilters = {
          status: "published",
        };

        if (selectedExamId) filters.examId = selectedExamId;
        if (selectedSubjectId) filters.subjectId = selectedSubjectId;
        if (selectedBatchTag) filters.tag = selectedBatchTag;
        if (selectedDifficulty && selectedDifficulty !== "all") {
          filters.difficulty = selectedDifficulty as any;
        }
        if (selectedVerified === "verified") {
          filters.adminVerified = true;
        } else if (selectedVerified === "unverified") {
          filters.adminVerified = false;
        }

        const res = await getQuestions(filters, pageSize, lastDoc);
        setQuestions(res.questions);
        setHasMore(res.hasMore);

        if (res.lastDoc) {
          setPageDocSnapshots((prev) => {
            const next = [...prev];
            next[page - 1] = res.lastDoc!;
            return next;
          });
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedExamId, selectedSubjectId, selectedBatchTag, selectedDifficulty, selectedVerified]
  );

  // Trigger fetch when primary filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageDocSnapshots([]);
    fetchQuestionsForPage(1, null);
  }, [fetchQuestionsForPage]);

  // Handle Page Advance
  const handleNextPage = () => {
    if (!hasMore || loading) return;
    const nextPage = currentPage + 1;
    const lastDoc = pageDocSnapshots[currentPage - 1] || null;
    setCurrentPage(nextPage);
    fetchQuestionsForPage(nextPage, lastDoc);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Page Retract
  const handlePrevPage = () => {
    if (currentPage <= 1 || loading) return;
    const prevPage = currentPage - 1;
    const lastDoc = prevPage === 1 ? null : pageDocSnapshots[prevPage - 2] || null;
    setCurrentPage(prevPage);
    fetchQuestionsForPage(prevPage, lastDoc);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Bookmark Toggle Handler
  const handleToggleBookmark = async (questionId: string) => {
    if (!user) {
      alert(t("বুকমার্ক করতে অনুগ্রহ করে লগইন করুন।", "Please sign in to bookmark questions."));
      return;
    }

    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });

    try {
      await toggleBookmark(user.uid, questionId);
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(questionId)) next.delete(questionId);
        else next.add(questionId);
        return next;
      });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedSubjectId("");
    setSelectedBatchTag("");
    setSelectedDifficulty("all");
    setSelectedVerified("all");
    setSearchQuery("");
  };

  // Client-side text search over current loaded results
  const displayedQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase().trim();
    return questions.filter((item) => {
      const matchQ = item.question?.toLowerCase().includes(q);
      const matchExp = item.explanation?.toLowerCase().includes(q);
      const matchSource = item.source?.toLowerCase().includes(q);
      const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));
      return matchQ || matchExp || matchSource || matchTag;
    });
  }, [questions, searchQuery]);

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6 pb-24">
      {/* 1. Header Banner & Study Mode Switcher */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8]">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
              {t("প্রশ্ন ব্যাংক অধ্যয়ন", "Question Bank Study")}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("প্রশ্ন ব্যাংক ও প্রস্তুতি আর্কাইভ", "Question Bank & Study Archive")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            {t(
              "বিসিএস ও সরকারি চাকরির বিগত বছরের ৫,৪২৩+ ভেরিফাইড প্রশ্ন সমাধান, বিস্তারিত ব্যাখ্যা ও গাণিতিক সূত্রসহ নির্ভুলভাবে পড়ুন।",
              "Study 5,423+ verified past BCS and government job questions with interactive answers, detailed explanations, and KaTeX formulas."
            )}
          </p>
        </div>

        {/* Reveal Answer Master Switch */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setAutoRevealAll(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              !autoRevealAll
                ? "bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span>{t("উত্তর লুকানো (স্ব-মূল্যায়ন)", "Hide Answers (Self-Test)")}</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRevealAll(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              autoRevealAll
                ? "bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{t("সব উত্তর একবারে দেখান", "Reveal All Answers")}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Exam Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {exams.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => {
              setSelectedExamId(ex.id);
              setSelectedSubjectId("");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedExamId === ex.id
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* 3. Multi-Level Subject Filter Carousel with Live Firestore Question Counts */}
      {subjects.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedSubjectId("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSubjectId === ""
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold"
                : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <span>{t("সব বিষয়", "All Subjects")}</span>
            {totalExamQuestionCount > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  selectedSubjectId === ""
                    ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {n(totalExamQuestionCount)}
              </span>
            )}
          </button>

          {subjects.map((sub) => {
            const count = subjectCounts[sub.id];
            const isSelected = selectedSubjectId === sub.id;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#4F46E5] text-white font-semibold shadow-2xs"
                    : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <span>{sub.name}</span>
                {typeof count === "number" && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                    }`}
                  >
                    {n(count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Controls Toolbar: Batch Dropdown, Difficulty, Search */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              "প্রশ্ন বা সমাধান সার্চ করুন (যেমন: চর্যাপদ, log, পাল বংশ)...",
              "Search question or explanation (e.g. Charyapada, log, Pala dynasty)..."
            )}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Right: Batch Dropdown + Difficulty + Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* BCS Batch Selector */}
          {selectedExamId === "exam_bcs" && (
            <select
              value={selectedBatchTag}
              onChange={(e) => setSelectedBatchTag(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {BCS_BATCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {lang === "bn" ? b.labelBn : b.labelEn}
                </option>
              ))}
            </select>
          )}

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">{t("সব কাঠিন্য (All Difficulty)", "All Difficulties")}</option>
            <option value="easy">{t("সহজ (Easy)", "Easy")}</option>
            <option value="medium">{t("মধ্যম (Medium)", "Medium")}</option>
            <option value="hard">{t("কঠিন (Hard)", "Hard")}</option>
          </select>

          {/* Admin Verified Filter */}
          <select
            value={selectedVerified}
            onChange={(e) => setSelectedVerified(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">{t("সকল প্রশ্ন (All Questions)", "All Questions")}</option>
            <option value="verified">{t("ভেরিফাইড প্রশ্ন (Admin Verified)", "Admin Verified Only")}</option>
          </select>

          {/* Reset Filters */}
          {(selectedSubjectId || selectedBatchTag || selectedDifficulty !== "all" || selectedVerified !== "all" || searchQuery) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs gap-1.5 text-slate-600 dark:text-slate-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t("রিসেট", "Reset")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 5. Study Question Cards Stream */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-4"
            >
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="space-y-2 pt-2">
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedQuestions.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            {t("কোন প্রশ্ন পাওয়া যায়নি", "No Questions Found")}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t(
              "আপনার নির্বাচিত ফিল্টার বা সার্চ কিওয়ার্ডের সাথে মিল রেখে কোনো প্রশ্ন পাওয়া যায়নি। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।",
              "No questions matched your selected filters or search keywords. Please reset your filters and try again."
            )}
          </p>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 mt-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("ফিল্টার রিসেট করুন", "Reset Filters")}</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedQuestions.map((question, idx) => (
            <StudyQuestionCard
              key={question.id}
              index={(currentPage - 1) * pageSize + idx}
              question={question}
              defaultRevealed={autoRevealAll}
              isBookmarked={bookmarkedIds.has(question.id)}
              onToggleBookmark={handleToggleBookmark}
              subjectName={subjectMap.get(question.subjectId)}
            />
          ))}
        </div>
      )}

      {/* 6. Cursor Pagination Footer */}
      {!loading && questions.length > 0 && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="text-xs gap-1 text-slate-700 dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t("পূর্ববর্তী পাতা", "Previous Page")}</span>
          </Button>

          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t(
              `পৃষ্ঠা ${n(currentPage)} • ${n(questions.length)}টি প্রশ্ন প্রদর্শিত`,
              `Page ${currentPage} • Showing ${questions.length} questions`
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasMore || loading}
            className="text-xs gap-1 text-slate-700 dark:text-slate-300"
          >
            <span>{t("পরবর্তী পাতা", "Next Page")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
