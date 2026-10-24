"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Filter,
  Search,
  Sparkles,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  CheckSquare,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Question, Exam, Subject, QuestionDifficulty, QuestionStatus } from "@/types";
import {
  getQuestions,
  deleteQuestion,
  updateQuestion,
  updateQuestionStatus,
  updateQuestionAdminVerified,
  updateQuestionSubject,
  bulkUpdateQuestionAdminVerified,
  resetAllQuestionsVerification,
  getQuestionStats,
  seedSampleQuestions,
} from "@/lib/services/question-service";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects, getSubjectsByExamId } from "@/lib/services/subject-service";
import { BCS_BATCHES } from "@/lib/constants/bcs-batches";
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

  // Live Verification Stats
  const [stats, setStats] = useState<{
    totalCount: number;
    verifiedCount: number;
    unverifiedCount: number;
  }>({ totalCount: 0, verifiedCount: 0, unverifiedCount: 0 });

  // Filter States
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("published");
  const [selectedVerified, setSelectedVerified] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(20);

  // Multi-select & Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetProgress, setResetProgress] = useState<{ done: number; total: number } | null>(
    null
  );

  const [isSeeding, setIsSeeding] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Read optional query parameters (?verified=false&subjectId=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const vParam = params.get("verified");
      const subParam = params.get("subjectId");
      if (vParam === "true" || vParam === "false") {
        setSelectedVerified(vParam);
      }
      if (subParam) {
        setSelectedSubjectId(subParam);
      }
    }
  }, []);

  const refreshStats = useCallback(async () => {
    const res = await getQuestionStats();
    setStats(res);
  }, []);

  // Load Catalogs & Stats
  useEffect(() => {
    async function loadCatalogs() {
      const [examList] = await Promise.all([getExams(true), refreshStats()]);
      setExams(examList);
    }
    loadCatalogs();
  }, [refreshStats]);

  // Update Subjects when selectedExamId changes
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedExamId) {
        const allSubs = await getSubjects(true);
        setSubjects(allSubs);
        return;
      }
      const subList = await getSubjectsByExamId(selectedExamId, true);
      setSubjects(subList);
    }
    loadSubjects();
  }, [selectedExamId]);

  // Fetch Questions
  const fetchQuestionsList = useCallback(
    async (isReset: boolean = true) => {
      if (isReset) {
        setLoading(true);
        setSelectedIds([]);
      } else {
        setLoadingMore(true);
      }

      const filters: any = {};
      if (selectedExamId) filters.examId = selectedExamId;
      if (selectedSubjectId) filters.subjectId = selectedSubjectId;
      if (selectedBatch) filters.tag = selectedBatch;
      if (selectedDifficulty) filters.difficulty = selectedDifficulty as QuestionDifficulty;
      if (selectedStatus) filters.status = selectedStatus as QuestionStatus;
      if (selectedVerified === "true") filters.adminVerified = true;
      if (selectedVerified === "false") filters.adminVerified = false;

      const currentLastDoc = isReset ? null : lastDoc;
      const res = await getQuestions(filters, pageSize, currentLastDoc);

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
    [
      selectedExamId,
      selectedSubjectId,
      selectedBatch,
      selectedDifficulty,
      selectedStatus,
      selectedVerified,
      pageSize,
      lastDoc,
    ]
  );

  useEffect(() => {
    fetchQuestionsList(true);
  }, [
    selectedExamId,
    selectedSubjectId,
    selectedBatch,
    selectedDifficulty,
    selectedStatus,
    selectedVerified,
    pageSize,
  ]);

  // Filtered by Search query locally
  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery) return true;
    const lower = searchQuery.toLowerCase();
    const matchPrompt = q.question.toLowerCase().includes(lower);
    const matchTags = q.tags.some((t) => t.toLowerCase().includes(lower));
    const matchSource = q.source?.toLowerCase().includes(lower) || false;
    const matchId = q.id.toLowerCase().includes(lower);
    return matchPrompt || matchTags || matchSource || matchId;
  });

  // Handle Single Verification Toggle
  const handleVerifyToggle = async (id: string, verified: boolean) => {
    const prevQ = questions.find((q) => q.id === id);
    await updateQuestionAdminVerified(id, verified, user?.uid || "admin");

    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, adminVerified: verified } : q))
    );

    if (prevQ && Boolean(prevQ.adminVerified) !== verified) {
      setStats((prev) => {
        const delta = verified ? 1 : -1;
        const nextVerified = Math.max(0, Math.min(prev.totalCount, prev.verifiedCount + delta));
        return {
          ...prev,
          verifiedCount: nextVerified,
          unverifiedCount: Math.max(0, prev.totalCount - nextVerified),
        };
      });
    }
  };

  // Handle Inline Quick Edit & Optional Verify
  const handleInlineUpdate = async (
    id: string,
    updates: Partial<Question>,
    markVerified?: boolean
  ) => {
    const prevQ = questions.find((q) => q.id === id);
    await updateQuestion(id, {
      ...updates,
      updatedBy: user?.uid || "admin",
    });

    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );

    if (
      typeof markVerified === "boolean" &&
      prevQ &&
      Boolean(prevQ.adminVerified) !== markVerified
    ) {
      setStats((prev) => {
        const delta = markVerified ? 1 : -1;
        const nextVerified = Math.max(0, Math.min(prev.totalCount, prev.verifiedCount + delta));
        return {
          ...prev,
          verifiedCount: nextVerified,
          unverifiedCount: Math.max(0, prev.totalCount - nextVerified),
        };
      });
    }

    setFeedbackMessage(
      markVerified
        ? `Question ${id} updated and marked as Admin Verified!`
        : `Question ${id} updated successfully.`
    );
  };

  // Handle Subject Change
  const handleSubjectChange = async (id: string, newSubjectId: string) => {
    await updateQuestionSubject(id, newSubjectId, user?.uid || "admin");
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, subjectId: newSubjectId } : q))
    );
  };

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
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    await refreshStats();
  };

  // Multi-select helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allVisibleSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => selectedIds.includes(q.id));

  const handleToggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleSet = new Set(filteredQuestions.map((q) => q.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...filteredQuestions.map((q) => q.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  // Bulk Verify / Unverify Selected
  const handleBulkVerifySelected = async (verified: boolean) => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    setFeedbackMessage(null);
    try {
      const count = await bulkUpdateQuestionAdminVerified(
        selectedIds,
        verified,
        user?.uid || "admin"
      );
      const selectedSet = new Set(selectedIds);
      setQuestions((prev) =>
        prev.map((q) => (selectedSet.has(q.id) ? { ...q, adminVerified: verified } : q))
      );
      setSelectedIds([]);
      await refreshStats();
      setFeedbackMessage(
        verified
          ? `${count}টি প্রশ্ন সফলভাবে ভেরিফাইড (Verified) হিসেবে চিহ্নিত করা হয়েছে!`
          : `${count}টি প্রশ্ন আন-ভেরিফাইড (রিভিউ প্রয়োজন) হিসেবে চিহ্নিত করা হয়েছে।`
      );
    } catch (err: any) {
      setFeedbackMessage(`Bulk update error: ${err?.message}`);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Reset All (or current Subject) to Unverified so Admin can manually verify from 0
  const handleResetAllVerification = async (targetVerified: boolean) => {
    setIsBulkUpdating(true);
    setFeedbackMessage(null);
    try {
      const count = await resetAllQuestionsVerification(
        targetVerified,
        user?.uid || "admin",
        (done, total) => setResetProgress({ done, total }),
        selectedSubjectId || undefined
      );
      setQuestions((prev) =>
        prev.map((q) => ({ ...q, adminVerified: targetVerified }))
      );
      setShowResetConfirm(false);
      setResetProgress(null);
      await refreshStats();
      await fetchQuestionsList(true);
      setFeedbackMessage(
        targetVerified
          ? `${count}টি প্রশ্ন ভেরিফাইড হিসেবে আপডেট করা হয়েছে।`
          : `${count}টি প্রশ্ন আন-ভেরিফাইড (রিভিউ প্রয়োজন) অবস্থায় রিসেট করা হয়েছে। এখন আপনি ম্যানুয়ালি রিভিউ ও ভেরিফাই করতে পারবেন!`
      );
    } catch (err: any) {
      setFeedbackMessage(`Reset error: ${err?.message}`);
    } finally {
      setIsBulkUpdating(false);
      setResetProgress(null);
    }
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
      await refreshStats();
    } catch (err: any) {
      setFeedbackMessage(`Seeding error: ${err?.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const verifiedPercent =
    stats.totalCount > 0
      ? Math.round((stats.verifiedCount / stats.totalCount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Question Bank & Manual Verification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ম্যানুয়ালি প্রশ্ন রিভিউ, দ্রুত এডিট (Quick Edit), বিষয় পরিবর্তন এবং ভেরিফাই (Verify) করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetConfirm(!showResetConfirm)}
            className="text-xs gap-1.5 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {selectedSubjectId ? "এই বিষয়ের ভেরিফিকেশন রিসেট" : "সব প্রশ্ন আন-ভেরিফাই রিসেট"}
          </Button>

          <Link href="/admin/questions/new">
            <Button variant="primary" size="sm" className="text-xs gap-1.5 font-semibold">
              <PlusCircle className="h-3.5 w-3.5" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Confirmation Drawer for Resetting Verification */}
      {showResetConfirm && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                ম্যানুয়াল ভেরিফিকেশন শুরু করার জন্য রিসেট করবেন?
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {selectedSubjectId
                  ? "নির্বাচিত বিষয়ের সকল প্রশ্ন 'রিভিউ প্রয়োজন (Unverified)' অবস্থায় রিসেট হবে, যাতে আপনি নিজে একে একে বা পেজ অনুযায়ী রিভিউ করে ভেরিফাই করতে পারেন।"
                  : `ডাটাবেসের সকল প্রশ্ন (${stats.totalCount.toLocaleString()}টি) 'রিভিউ প্রয়োজন (Unverified)' অবস্থায় রিসেট হবে, যাতে অ্যাডমিন প্যানেল থেকে আপনি ম্যানুয়ালি ভেরিফাই করতে পারেন।`}
              </p>
            </div>
          </div>

          {resetProgress && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-amber-900 dark:text-amber-200">
                <span>রিসেট হচ্ছে (Updating Firestore batches)...</span>
                <span>
                  {resetProgress.done.toLocaleString()} / {resetProgress.total.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-900 overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all duration-200"
                  style={{
                    width: `${
                      resetProgress.total > 0
                        ? Math.round((resetProgress.done / resetProgress.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button
              variant="primary"
              size="sm"
              isLoading={isBulkUpdating}
              onClick={() => handleResetAllVerification(false)}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              হ্যাঁ, আন-ভেরিফাই (Unverified) রিসেট করুন
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={isBulkUpdating}
              onClick={() => handleResetAllVerification(true)}
              className="text-xs text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              সব প্রশ্ন ভেরিফাইড (Verified) করুন
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isBulkUpdating}
              onClick={() => setShowResetConfirm(false)}
              className="text-xs"
            >
              বাতিল (Cancel)
            </Button>
          </div>
        </div>
      )}

      {/* Live Verification Progress Strip & Quick Queue Tabs */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedVerified("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                selectedVerified === ""
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              সব প্রশ্ন (All)
              <span className="px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[11px]">
                {stats.totalCount.toLocaleString()}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedVerified("false")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                selectedVerified === "false"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70 hover:bg-amber-100/70"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              রিভিউ প্রয়োজন (Unverified Queue)
              <span className="px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[11px]">
                {stats.unverifiedCount.toLocaleString()}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedVerified("true")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                selectedVerified === "true"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-100/70"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              ভেরিফাইড (Manually Verified)
              <span className="px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[11px]">
                {stats.verifiedCount.toLocaleString()}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>
              ভেরিফিকেশন অগ্রগতি:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {verifiedPercent}%
              </strong>{" "}
              ({stats.verifiedCount.toLocaleString()} / {stats.totalCount.toLocaleString()})
            </span>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${verifiedPercent}%` }}
          />
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-600 hover:underline font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Filter className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Filter Questions (বিষয়, বিসিএস ব্যাচ ও স্ট্যাটাস অনুযায়ী ফিল্টার)
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-7 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 text-xs">
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
            disabled={subjects.length === 0}
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

          {/* 10th-50th BCS Batch Filter */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {BCS_BATCHES.map((b) => (
              <option key={b.id || "all"} value={b.id}>
                {b.labelBilingual}
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

          {/* Verification Filter */}
          <select
            value={selectedVerified}
            onChange={(e) => setSelectedVerified(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Verification (সব)</option>
            <option value="false">রিভিউ প্রয়োজন (Unverified)</option>
            <option value="true">ভেরিফাইড (Verified)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search loaded questions by prompt, ID, tag, or source (e.g. 45th BCS, চর্যাপদ)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Bulk Selection & Batch Verification Action Bar */}
      {filteredQuestions.length > 0 && (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleToggleSelectAllVisible}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>
                Select All on Page ({filteredQuestions.length})
              </span>
            </label>
            {selectedIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                {selectedIds.length}টি নির্বাচিত (Selected)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={selectedIds.length === 0}
              isLoading={isBulkUpdating}
              onClick={() => handleBulkVerifySelected(true)}
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              নির্বাচিতগুলো ভেরিফাই করুন ({selectedIds.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0}
              isLoading={isBulkUpdating}
              onClick={() => handleBulkVerifySelected(false)}
              className="text-xs gap-1.5 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 disabled:opacity-50"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              নির্বাচিতগুলো আন-ভেরিফাই ({selectedIds.length})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchQuestionsList(true);
                refreshStats();
              }}
              className="text-xs gap-1 h-8"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      )}

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
              No questions found in this filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {selectedVerified === "false" && stats.unverifiedCount === 0
                ? "বর্তমানে সব প্রশ্নই ভেরিফাইড অবস্থায় আছে। ম্যানুয়ালি রিভিউ শুরু করতে উপরের 'সব প্রশ্ন আন-ভেরিফাই রিসেট' বাটনে ক্লিক করুন।"
                : "No questions match your current filters. Try relaxing filters or switching verification tabs."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {selectedVerified === "false" && stats.unverifiedCount === 0 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                সব প্রশ্ন আন-ভেরিফাই রিসেট করুন
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedExamId("");
                  setSelectedSubjectId("");
                  setSelectedBatch("");
                  setSelectedDifficulty("");
                  setSelectedVerified("");
                  setSearchQuery("");
                }}
                className="text-xs"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const examObj = exams.find((e) => e.id === q.examId);
            const subjectObj = subjects.find((s) => s.id === q.subjectId);
            return (
              <QuestionCard
                key={q.id}
                question={q}
                examName={examObj?.name}
                subjectName={subjectObj?.name}
                allSubjects={subjects}
                selected={selectedIds.includes(q.id)}
                onToggleSelect={handleToggleSelect}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onVerifyToggle={handleVerifyToggle}
                onSubjectChange={handleSubjectChange}
                onInlineUpdate={handleInlineUpdate}
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
                Load More Questions (আরও প্রশ্ন লোড করুন)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
