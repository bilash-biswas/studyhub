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
import {
  BCS_TOTAL_QUESTION_COUNT,
  BCS_GLOBAL_SUBJECT_COUNTS,
  BCS_BATCH_TOTAL_COUNTS,
  BCS_BATCH_SUBJECT_COUNTS,
} from "@/lib/constants/bcs-batch-counts";
import { StudyQuestionCard } from "@/components/question-bank/study-question-card";
import { QuestionCardSkeleton } from "@/components/ui/skeletons";
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
  Bookmark,
  Printer,
  SlidersHorizontal,
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
  const [selectedBatchEra, setSelectedBatchEra] = useState<"all" | "recent" | "classic">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [bookmarkOnly, setBookmarkOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Default state: Answers hidden for active self-testing, with a master switch
  const [autoRevealAll, setAutoRevealAll] = useState<boolean>(false);
  // Density view state (Compact vs Detailed)
  const [density, setDensity] = useState<"detailed" | "compact">("detailed");

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
          const counts = await getSubjectQuestionCounts(subs.map((s) => s.id), false);
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

  // Dynamically resolve subject counts based on selected batch or global canonical baseline
  const displayedSubjectCounts = useMemo(() => {
    if (selectedBatchTag && BCS_BATCH_SUBJECT_COUNTS[selectedBatchTag]) {
      return BCS_BATCH_SUBJECT_COUNTS[selectedBatchTag];
    }
    return {
      ...BCS_GLOBAL_SUBJECT_COUNTS,
      ...subjectCounts,
    };
  }, [selectedBatchTag, subjectCounts]);

  // Dynamically resolve total question count based on selected batch or global canonical baseline
  const currentTotalQuestionCount = useMemo(() => {
    if (selectedBatchTag && BCS_BATCH_TOTAL_COUNTS[selectedBatchTag]) {
      return BCS_BATCH_TOTAL_COUNTS[selectedBatchTag];
    }
    const sum = Object.values(subjectCounts).reduce((acc, c) => acc + c, 0);
    return sum > 0 ? sum : BCS_TOTAL_QUESTION_COUNT;
  }, [selectedBatchTag, subjectCounts]);

  // Subject Name Lookup Map
  const subjectMap = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [subjects]);

  // Filtered Batches based on Era Preset
  const filteredBatches = useMemo(() => {
    if (selectedBatchEra === "recent") {
      return BCS_BATCHES.filter((b) => {
        if (!b.id) return true;
        const m = b.id.match(/^(\d+)/);
        if (m) {
          const num = parseInt(m[1], 10);
          return num >= 40 && num <= 50;
        }
        return false;
      });
    }
    if (selectedBatchEra === "classic") {
      return BCS_BATCHES.filter((b) => {
        if (!b.id) return true;
        const m = b.id.match(/^(\d+)/);
        if (m) {
          const num = parseInt(m[1], 10);
          return num >= 10 && num <= 39;
        }
        return false;
      });
    }
    return BCS_BATCHES;
  }, [selectedBatchEra]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSubjectId) count++;
    if (selectedBatchTag) count++;
    if (selectedBatchEra !== "all") count++;
    if (selectedDifficulty !== "all") count++;
    if (bookmarkOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedSubjectId, selectedBatchTag, selectedBatchEra, selectedDifficulty, bookmarkOnly, searchQuery]);

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
    [selectedExamId, selectedSubjectId, selectedBatchTag, selectedDifficulty]
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
    setSelectedBatchEra("all");
    setSelectedDifficulty("all");
    setBookmarkOnly(false);
    setSearchQuery("");
  };

  // Helper to test if question belongs to a BCS era
  const isQuestionInEra = (item: Question, era: "all" | "recent" | "classic") => {
    if (era === "all") return true;
    const textToCheck = `${item.source || ""} ${item.tags?.join(" ") || ""}`.toLowerCase();
    const match = textToCheck.match(/(\d+)(?:st|nd|rd|th)?(?:-|\s)?bcs/);
    if (!match) return true;
    const bcsNum = parseInt(match[1], 10);
    if (era === "recent") return bcsNum >= 40 && bcsNum <= 50;
    if (era === "classic") return bcsNum >= 10 && bcsNum <= 39;
    return true;
  };

  // Client-side text search and secondary filter evaluation over current loaded results
  const displayedQuestions = useMemo(() => {
    let list = questions;

    // Filter by Era preset if no specific batch tag is selected
    if (!selectedBatchTag && selectedBatchEra !== "all") {
      list = list.filter((item) => isQuestionInEra(item, selectedBatchEra));
    }

    // Filter by Bookmarks only
    if (bookmarkOnly) {
      list = list.filter((item) => bookmarkedIds.has(item.id));
    }

    // Client-side text search over current loaded results
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const matchQ = item.question?.toLowerCase().includes(q);
        const matchExp = item.explanation?.toLowerCase().includes(q);
        const matchSource = item.source?.toLowerCase().includes(q);
        const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));
        return matchQ || matchExp || matchSource || matchTag;
      });
    }

    return list;
  }, [questions, selectedBatchTag, selectedBatchEra, bookmarkOnly, bookmarkedIds, searchQuery]);

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
              {currentTotalQuestionCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                  {n(currentTotalQuestionCount)} {t("প্রশ্ন", "Questions")}
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

        {/* Right Action Bar: Search, Density, Answer Mode & Print */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap print:hidden">
          {/* Density Toggle (Compact vs Detailed) */}
          <div className="flex items-center rounded-full border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setDensity("detailed")}
              title={t("বিস্তারিত ভিউ", "Detailed view")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                density === "detailed"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {t("বিস্তারিত", "Detailed")}
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              title={t("কমপ্যাক্ট ভিউ (এক নজরে দ্রুত ব্রাউজ)", "Compact view (Fast browse)")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                density === "compact"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {t("কমপ্যাক্ট", "Compact")}
            </button>
          </div>

          {/* Minimal Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("প্রশ্ন খুঁজুন...", "Search questions...")}
              className="w-36 sm:w-48 focus:w-56 transition-all pl-8 pr-7 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-400 rounded-full text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
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

          {/* Reveal Answers Master Switch with clear text label */}
          <button
            type="button"
            onClick={() => setAutoRevealAll((prev) => !prev)}
            title={
              autoRevealAll
                ? t("সব উত্তর দৃশ্যমান রয়েছে", "All answers visible")
                : t("উত্তর লুকানো (অনুশীলন মোড)", "Answers hidden (Self-test mode)")
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              autoRevealAll
                ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
            }`}
          >
            {autoRevealAll ? (
              <>
                <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t("সব উত্তর দৃশ্যমান", "All Answers Shown")}</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                <span>{t("উত্তর লুকানো", "Answers Hidden")}</span>
              </>
            )}
          </button>

          {/* Print / PDF Study Sheet Export Button */}
          <button
            type="button"
            onClick={() => window.print()}
            title={t("প্রশ্ন তালিকা প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন", "Print or save questions as PDF")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">{t("প্রিন্ট / PDF", "Print / PDF")}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Filter Strip: Batch Era Presets, Batch Select, & Horizontal Subject Strip */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-2xs space-y-2 print:hidden">
        <div className="flex items-center gap-2">
          {/* Fixed BCS Batch Selector Pill */}
          {selectedExamId === "exam_bcs" && (
            <div className="shrink-0 flex items-center gap-1.5">
              <select
                value={selectedBatchTag}
                onChange={(e) => setSelectedBatchTag(e.target.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                  selectedBatchTag
                    ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300"
                }`}
              >
                {filteredBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {lang === "bn" ? b.labelBn : b.labelEn}
                  </option>
                ))}
              </select>

              {/* Era Quick Presets (Small chips) */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-full text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedBatchEra("all")}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    selectedBatchEra === "all"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {t("সব", "All")}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBatchEra("recent")}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    selectedBatchEra === "recent"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {t("৪০–৫০তম", "40th-50th")}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBatchEra("classic")}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    selectedBatchEra === "classic"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {t("১০–৩৯তম", "10th-39th")}
                </button>
              </div>
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
              {currentTotalQuestionCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedSubjectId === ""
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {n(currentTotalQuestionCount)}
                </span>
              )}
            </button>

            {/* Per-Subject Pills with Live Counts */}
            {subjects.map((sub) => {
              const count = displayedSubjectCounts[sub.id];
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
        </div>
      </div>

      {/* 3. Secondary Multi-Criteria Strip: Difficulty & Bookmarks */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-2 sm:px-3 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        {/* Left: Difficulty Segmented Control */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t("লেভেল:", "Level:")}
            </span>
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 p-0.5 text-xs font-medium">
              {[
                { id: "all", labelBn: "সব লেভেল", labelEn: "All" },
                { id: "easy", labelBn: "সহজ", labelEn: "Easy" },
                { id: "medium", labelBn: "মাঝারি", labelEn: "Medium" },
                { id: "hard", labelBn: "কঠিন", labelEn: "Hard" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(lvl.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedDifficulty === lvl.id
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {lang === "bn" ? lvl.labelBn : lvl.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Bookmark-Only Quick Toggle */}
          <button
            type="button"
            onClick={() => setBookmarkOnly((prev) => !prev)}
            title={t("শুধুমাত্র আপনার বুকমার্ককৃত প্রশ্নগুলি দেখুন", "Show only your bookmarked questions")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              bookmarkOnly
                ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800/80 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${bookmarkOnly ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
            <span>{t("বুকমার্ককৃত", "Bookmarked")}</span>
            {bookmarkedIds.size > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  bookmarkOnly
                    ? "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {n(bookmarkedIds.size)}
              </span>
            )}
          </button>
        </div>

        {/* Right: Quick Era Tabs for Mobile/Tablet */}
        <div className="flex md:hidden items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedBatchEra("all")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              selectedBatchEra === "all"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {t("সব", "All")}
          </button>
          <button
            type="button"
            onClick={() => setSelectedBatchEra("recent")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              selectedBatchEra === "recent"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {t("৪০–৫০তম", "40th-50th")}
          </button>
          <button
            type="button"
            onClick={() => setSelectedBatchEra("classic")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              selectedBatchEra === "classic"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {t("১০–৩৯তম", "10th-39th")}
          </button>
        </div>
      </div>

      {/* 4. Active Filters Summary Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs print:hidden">
          <div className="flex items-center gap-1.5 flex-wrap text-slate-700 dark:text-slate-300">
            <Filter className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {t("দেখাচ্ছে:", "Showing:")}
            </span>
            {selectedBatchTag && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-medium">
                {BCS_BATCHES.find((b) => b.id === selectedBatchTag)?.labelBn || selectedBatchTag}
              </span>
            )}
            {selectedBatchEra !== "all" && !selectedBatchTag && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-medium">
                {selectedBatchEra === "recent"
                  ? t("সাম্প্রতিক ৪০–৫০তম বিসিএস", "Recent 40th–50th BCS")
                  : t("বিগত ১০–৩৯তম বিসিএস", "Past 10th–39th BCS")}
              </span>
            )}
            {selectedSubjectId && (
              <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-medium">
                {subjectMap.get(selectedSubjectId) || selectedSubjectId}
              </span>
            )}
            {selectedDifficulty !== "all" && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-medium">
                {selectedDifficulty === "easy"
                  ? t("সহজ লেভেল", "Easy Level")
                  : selectedDifficulty === "medium"
                  ? t("মাঝারি লেভেল", "Medium Level")
                  : t("কঠিন লেভেল", "Hard Level")}
              </span>
            )}
            {bookmarkOnly && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-medium">
                {t("⭐ সংরক্ষিত", "⭐ Saved")}
              </span>
            )}
            {searchQuery.trim() && (
              <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                "{searchQuery.trim()}"
              </span>
            )}
            <span className="text-slate-400">•</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {t(`${n(displayedQuestions.length)}টি প্রশ্ন`, `${displayedQuestions.length} questions`)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer shrink-0"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("রিসেট ✕", "Reset ✕")}</span>
          </button>
        </div>
      )}

      {/* 5. Printable Header (Shown ONLY during print / PDF export) */}
      <div className="hidden print:block mb-6 border-b border-black pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">মেধাবী • প্রশ্ন ব্যাংক স্টাডি শিট</h1>
            <p className="text-sm text-gray-700">
              {selectedBatchTag
                ? BCS_BATCHES.find((b) => b.id === selectedBatchTag)?.labelBn || selectedBatchTag
                : "বিসিএস প্রিলিমিনারি প্রশ্ন ব্যাংক"}
              {selectedSubjectId ? ` • ${subjectMap.get(selectedSubjectId)}` : ""}
            </p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>প্রিন্টের তারিখ: {new Date().toLocaleDateString("bn-BD")}</p>
            <p>মোট প্রশ্ন: {displayedQuestions.length}টি</p>
          </div>
        </div>
      </div>

      {/* 6. Study Question Cards Stream */}
      {loading ? (
        <QuestionCardSkeleton count={4} density={density} />
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
              density={density}
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
