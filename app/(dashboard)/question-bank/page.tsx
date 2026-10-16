"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Question, Exam, Subject } from "@/types";
import { getQuestions, QuestionFilters } from "@/lib/services/question-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjectsByExamId } from "@/lib/services/subject-service";
import { toggleBookmark, getUserBookmarkIds } from "@/lib/services/bookmark-service";
import { useAuth } from "@/hooks/useAuth";
import { StudyQuestionCard } from "@/components/question-bank/study-question-card";
import { Button } from "@/components/ui/button";
import { DocumentSnapshot } from "firebase/firestore";
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookMarked,
  Lightbulb,
  GraduationCap,
} from "lucide-react";

// BCS Preliminary Batches sorted newest to oldest
const BCS_BATCHES = [
  { id: "", label: "সব বিসিএস ব্যাচ (All Batches)" },
  { id: "46th-bcs", label: "৪৬তম বিসিএস (46th BCS)" },
  { id: "45th-bcs", label: "৪৫তম বিসিএস (45th BCS)" },
  { id: "44th-bcs", label: "৪৪তম বিসিএস (44th BCS)" },
  { id: "43rd-bcs", label: "৪৩তম বিসিএস (43rd BCS)" },
  { id: "42nd-bcs", label: "৪২তম বিসিএস বিশেষ (42nd BCS Special)" },
  { id: "41st-bcs", label: "৪১তম বিসিএস (41st BCS)" },
  { id: "40th-bcs", label: "৪০তম বিসিএস (40th BCS)" },
  { id: "39th-bcs", label: "৩৯তম বিসিএস বিশেষ (39th BCS Special)" },
  { id: "38th-bcs", label: "৩৮তম বিসিএস (38th BCS)" },
  { id: "37th-bcs", label: "৩৭তম বিসিএস (37th BCS)" },
  { id: "36th-bcs", label: "৩৬তম বিসিএস (36th BCS)" },
  { id: "35th-bcs", label: "৩৫তম বিসিএস (35th BCS)" },
  { id: "34th-bcs", label: "৩৪তম বিসিএস (34th BCS)" },
  { id: "33rd-bcs", label: "৩৩তম বিসিএস (33rd BCS)" },
  { id: "32nd-bcs", label: "৩২তম বিসিএস (32nd BCS)" },
  { id: "31st-bcs", label: "৩১তম বিসিএস (31st BCS)" },
  { id: "30th-bcs", label: "৩০তম বিসিএস (30th BCS)" },
  { id: "29th-bcs", label: "২৯তম বিসিএস (29th BCS)" },
  { id: "28th-bcs", label: "২৮তম বিসিএস (28th BCS)" },
  { id: "27th-bcs", label: "২৭তম বিসিএস (27th BCS)" },
  { id: "26th-bcs", label: "২৬তম বিসিএস (26th BCS)" },
  { id: "25th-bcs", label: "২৫তম বিসিএস (25th BCS)" },
  { id: "24th-bcs", label: "২৪তম বিসিএস (24th BCS)" },
  { id: "23rd-bcs", label: "২৩তম বিসিএস (23rd BCS)" },
  { id: "22nd-bcs", label: "২২তম বিসিএস (22nd BCS)" },
  { id: "21st-bcs", label: "২১তম বিসিএস (21st BCS)" },
  { id: "20th-bcs", label: "২০তম বিসিএস (20th BCS)" },
  { id: "19th-bcs", label: "১৯তম বিসিএস (19th BCS)" },
  { id: "18th-bcs", label: "১৮তম বিসিএস (18th BCS)" },
  { id: "17th-bcs", label: "১৭তম বিসিএস (17th BCS)" },
  { id: "16th-bcs", label: "১৬তম বিসিএস (16th BCS)" },
  { id: "15th-bcs", label: "১৫তম বিসিএস (15th BCS)" },
  { id: "14th-bcs", label: "১৪তম বিসিএস (14th BCS)" },
  { id: "13th-bcs", label: "১৩তম বিসিএস (13th BCS)" },
  { id: "12th-bcs", label: "১২তম বিসিএস (12th BCS)" },
  { id: "11th-bcs", label: "১১তম বিসিএস (11th BCS)" },
  { id: "10th-bcs", label: "১০ম বিসিএস (10th BCS)" },
];

export default function QuestionBankStudyPage() {
  const { user } = useAuth();

  // Core Data State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedExamId, setSelectedExamId] = useState<string>("exam_bcs");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedBatchTag, setSelectedBatchTag] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Study Mode State: "reading" (book mode) vs "self_quiz" (active recall)
  const [studyMode, setStudyMode] = useState<"reading" | "self_quiz">("reading");

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

  // 2. Load Subjects when Exam changes
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedExamId) return;
      try {
        const subs = await getSubjectsByExamId(selectedExamId);
        setSubjects(subs);
        setSelectedSubjectId(""); // reset subject
      } catch (err) {
        console.error("Error loading subjects:", err);
      }
    }
    loadSubjects();
  }, [selectedExamId]);

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
      alert("বুকমার্ক করতে অনুগ্রহ করে লগইন করুন।");
      return;
    }

    // Optimistic toggle
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
      // Revert on error
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
              Question Bank Study
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            প্রশ্ন ব্যাংক ও প্রস্তুতি আর্কাইভ (Study Archive)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            বিসিএস ও সরকারি চাকরির বিগত বছরের ৫,৪০০+ প্রশ্ন সমাধান, বিস্তারিত ব্যাখ্যা ও সূত্রসহ নির্ভুলভাবে পড়ুন।
          </p>
        </div>

        {/* Study Mode Toggle Buttons */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setStudyMode("reading")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              studyMode === "reading"
                ? "bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <BookMarked className="h-3.5 w-3.5" />
            <span>📖 অধ্যয়ন মোড (Reading)</span>
          </button>

          <button
            type="button"
            onClick={() => setStudyMode("self_quiz")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              studyMode === "self_quiz"
                ? "bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>💡 অনুশীলন মোড (Self-Quiz)</span>
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedExamId === ex.id
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* 3. Multi-Level Subject Filter Carousel */}
      {subjects.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedSubjectId("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
              selectedSubjectId === ""
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold"
                : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            সব বিষয় (All Subjects)
          </button>

          {subjects.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedSubjectId === sub.id
                  ? "bg-[#4F46E5] text-white font-semibold"
                  : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              {sub.name}
            </button>
          ))}
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
            placeholder="প্রশ্ন বা সমাধান সার্চ করুন (যেমন: চর্যাপদ, log, পাল বংশ)..."
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
                  {b.label}
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
            <option value="all">সব কাঠিন্য (Difficulty)</option>
            <option value="easy">সহজ (Easy)</option>
            <option value="medium">মধ্যম (Medium)</option>
            <option value="hard">কঠিন (Hard)</option>
          </select>

          {/* Reset Filters */}
          {(selectedSubjectId || selectedBatchTag || selectedDifficulty !== "all" || searchQuery) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs gap-1.5 text-slate-600 dark:text-slate-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>রিসেট</span>
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
            কোন প্রশ্ন পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনার নির্বাচিত ফিল্টার বা সার্চ কিওয়ার্ডের সাথে মিল রেখে কোনো প্রশ্ন পাওয়া যায়নি। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।
          </p>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 mt-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>ফিল্টার রিসেট করুন</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedQuestions.map((question, idx) => (
            <StudyQuestionCard
              key={question.id}
              index={(currentPage - 1) * pageSize + idx}
              question={question}
              studyMode={studyMode}
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
            <span>পূর্ববর্তী পাতা</span>
          </Button>

          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            পৃষ্ঠা {currentPage} • {questions.length}টি প্রশ্ন প্রদর্শিত
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasMore || loading}
            className="text-xs gap-1 text-slate-700 dark:text-slate-300"
          >
            <span>পরবর্তী পাতা</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
