"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Filter,
  Search,
  Sparkles,
  HelpCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Question, Exam, Subject, QuestionDifficulty, QuestionStatus } from "@/types";
import {
  getQuestions,
  deleteQuestion,
  updateQuestionStatus,
  seedSampleQuestions,
} from "@/lib/services/question-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjectsByExamId } from "@/lib/services/subject-service";
import { useAuth } from "@/hooks/useAuth";
import { QuestionCard } from "@/components/admin/question-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminQuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);

  // Filter States
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("published");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSeeding, setIsSeeding] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Load Catalogs
  useEffect(() => {
    async function loadCatalogs() {
      const examList = await getExams(true);
      setExams(examList);
    }
    loadCatalogs();
  }, []);

  // Update Subjects when selectedExamId changes
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedExamId) {
        setSubjects([]);
        setSelectedSubjectId("");
        return;
      }
      const subList = await getSubjectsByExamId(selectedExamId, true);
      setSubjects(subList);
      setSelectedSubjectId("");
    }
    loadSubjects();
  }, [selectedExamId]);

  // Fetch Questions
  const fetchQuestionsList = useCallback(
    async (isReset: boolean = true) => {
      if (isReset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const filters: any = {};
      if (selectedExamId) filters.examId = selectedExamId;
      if (selectedSubjectId) filters.subjectId = selectedSubjectId;
      if (selectedDifficulty) filters.difficulty = selectedDifficulty as QuestionDifficulty;
      if (selectedStatus) filters.status = selectedStatus as QuestionStatus;

      const currentLastDoc = isReset ? null : lastDoc;
      const res = await getQuestions(filters, 20, currentLastDoc);

      if (isReset) {
        setQuestions(res.questions);
      } else {
        setQuestions((prev) => [...prev, ...res.questions]);
      }

      setLastDoc(res.lastDoc);
      setHasMore(res.hasMore);
      setLoading(false);
      setLoadingMore(false);
    },
    [selectedExamId, selectedSubjectId, selectedDifficulty, selectedStatus, lastDoc]
  );

  useEffect(() => {
    fetchQuestionsList(true);
  }, [selectedExamId, selectedSubjectId, selectedDifficulty, selectedStatus]);

  // Handle Status Change
  const handleStatusChange = async (id: string, status: "draft" | "published" | "archived") => {
    await updateQuestionStatus(id, status, user?.uid || "admin");
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    await deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Handle Seed Sample Questions
  const handleSeed = async () => {
    setIsSeeding(true);
    setFeedbackMessage(null);
    try {
      const count = await seedSampleQuestions(user?.uid || "admin");
      setFeedbackMessage(
        count > 0 ? `Successfully seeded ${count} sample questions!` : "Sample questions already exist."
      );
      await fetchQuestionsList(true);
    } catch (err: any) {
      setFeedbackMessage(`Seeding error: ${err?.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Filtered by Search query locally
  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery) return true;
    const lower = searchQuery.toLowerCase();
    const matchPrompt = q.question.toLowerCase().includes(lower);
    const matchTags = q.tags.some((t) => t.toLowerCase().includes(lower));
    const matchSource = q.source?.toLowerCase().includes(lower) || false;
    return matchPrompt || matchTags || matchSource;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Question Bank Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage MCQ items, solutions, formula formatting, and publishing statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            isLoading={isSeeding}
            className="text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Seed Sample Questions
          </Button>

          <Link href="/admin/questions/new">
            <Button variant="primary" size="sm" className="text-xs gap-1.5 font-semibold">
              <PlusCircle className="h-3.5 w-3.5" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
          {feedbackMessage}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Filter className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          Filter Questions
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Exam Filter */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Exams (সব পরীক্ষা)</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            disabled={!selectedExamId || subjects.length === 0}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">All Subjects (সব বিষয়)</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy (সহজ)</option>
            <option value="medium">Medium (মাঝারি)</option>
            <option value="hard">Hard (কঠিন)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by topic, tag, keyword, or source (e.g. subnetting, algebra, 45th BCS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse p-5"
            />
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              No questions found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              No questions match your current filters. Try relaxing filters or click below to seed standard questions.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSeed} className="text-xs">
              Seed Sample Questions
            </Button>
            <Link href="/admin/questions/new">
              <Button variant="primary" size="sm" className="text-xs">
                Create First Question
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredQuestions.length} questions</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchQuestionsList(true)}
              className="text-xs gap-1 h-7"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>

          {filteredQuestions.map((q) => {
            const examObj = exams.find((e) => e.id === q.examId);
            const subjectObj = subjects.find((s) => s.id === q.subjectId);
            return (
              <QuestionCard
                key={q.id}
                question={q}
                examName={examObj?.name}
                subjectName={subjectObj?.name}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            );
          })}

          {/* Load More Button for Pagination */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchQuestionsList(false)}
                isLoading={loadingMore}
                className="text-xs"
              >
                Load More Questions
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
