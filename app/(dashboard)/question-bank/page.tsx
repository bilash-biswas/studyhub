"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Filter,
  X,
  Sparkles,
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

  // Default state: Answers hidden for active self-testing, with a master switch
  const [autoRevealAll, setAutoRevealAll] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pageDocSnapshots, setPageDocSnapshots] = useState<DocumentSnapshot[]>([]);
  const pageSize = 20;

  // Horizontal Scroll State & Helpers for Subject Strip
  const subjectsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = subjectsScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, subjects]);

  const scrollSubjects = (direction: "left" | "right") => {
    if (!subjectsScrollRef.current) return;
    const delta = direction === "left" ? -280 : 280;
    subjectsScrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
    setTimeout(checkScroll, 320);
  };

  const handleSubjectsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (subjectsScrollRef.current && e.deltaY !== 0) {
      subjectsScrollRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

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
        setSelectedSubjectId("");

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

  // Subject Name Lookup Map
  const subjectMap = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [subjects]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSubjectId) count++;
    if (selectedBatchTag) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedSubjectId, selectedBatchTag, searchQuery]);

  // 3. Fetch Questions Callback with Pagination
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
    <div className="max-w-5xl w-full mx-auto space-y-4 pb-24">
      {/* 1. Sleek Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {t("প্রশ্ন ব্যাংক", "Question Bank")}
              </h1>
              {totalExamQuestionCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                  {n(totalExamQuestionCount)} {t("প্রশ্ন", "Questions")}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "১০ম থেকে ৫০তম বিসিএস বিগত বছরের প্রশ্ন ও নির্ভুল সমাধান",
                "10th to 50th BCS past questions & verified solutions"
              )}
            </p>
          </div>
        </div>

        {/* Right Action Bar: Search & Master Answer Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Minimal Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("প্রশ্ন খুঁজুন...", "Search questions...")}
              className="w-40 sm:w-52 focus:w-64 transition-all pl-8 pr-7 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-400 rounded-full text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Reveal Answers Master Toggle */}
          <button
            type="button"
            onClick={() => setAutoRevealAll((prev) => !prev)}
            title={
              autoRevealAll
                ? t("সব উত্তর একবারে দৃশ্যমান রয়েছে", "All answers visible")
                : t("উত্তর লুকানো (অনুশীলন মোড)", "Answers hidden (Self-test mode)")
            }
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              autoRevealAll
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {autoRevealAll ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Single Slim 44px Quick-Filter Strip */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-2xs flex items-center gap-2">
        {/* Fixed BCS Batch Selector Pill */}
        {selectedExamId === "exam_bcs" && (
          <div className="shrink-0">
            <select
              value={selectedBatchTag}
              onChange={(e) => setSelectedBatchTag(e.target.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                selectedBatchTag
                  ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300"
              }`}
            >
              {BCS_BATCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {lang === "bn" ? b.labelBn : b.labelEn}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Left Scroll Chevron Button */}
        <button
          type="button"
          onClick={() => scrollSubjects("left")}
          disabled={!canScrollLeft}
          title={t("বামে স্ক্রল করুন", "Scroll left")}
          className={`p-1.5 rounded-full shrink-0 transition-all ${
            canScrollLeft
              ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              : "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-30"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Smooth Horizontal Scrollable Subjects Container */}
        <div
          ref={subjectsScrollRef}
          onScroll={checkScroll}
          onWheel={handleSubjectsWheel}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 custom-scrollbar"
        >
          {/* All Subjects Pill */}
          <button
            type="button"
            onClick={() => setSelectedSubjectId("")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSubjectId === ""
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <span>{t("সব বিষয়", "All Subjects")}</span>
          </button>

          {/* Per-Subject Pills with Live Counts */}
          {subjects.map((sub) => {
            const count = subjectCounts[sub.id];
            const isSelected = selectedSubjectId === sub.id;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#4F46E5] text-white font-semibold shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span>{sub.name}</span>
                {typeof count === "number" && count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {n(count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Chevron Button */}
        <button
          type="button"
          onClick={() => scrollSubjects("right")}
          disabled={!canScrollRight}
          title={t("ডানে স্ক্রল করুন", "Scroll right")}
          className={`p-1.5 rounded-full shrink-0 transition-all ${
            canScrollRight
              ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              : "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-30"
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Reset Filter Button (if active) */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("রিসেট", "Reset")}</span>
          </button>
        )}
      </div>

      {/* 3. Study Question Cards Stream */}
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

      {/* 4. Minimal Cursor Pagination Footer */}
      {!loading && questions.length > 0 && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-2xs flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="text-xs gap-1 text-slate-700 dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t("পূর্ববর্তী পাতা", "Previous")}</span>
          </Button>

          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t(
              `পৃষ্ঠা ${n(currentPage)} • ${n(questions.length)}টি প্রশ্ন প্রদর্শিত`,
              `Page ${currentPage} • Showing ${questions.length} questions`
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasMore || loading}
            className="text-xs gap-1 text-slate-700 dark:text-slate-300"
          >
            <span>{t("পরবর্তী পাতা", "Next")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
