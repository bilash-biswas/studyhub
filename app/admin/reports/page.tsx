"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  FileCheck2,
  Users,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Exam, Subject } from "@/types";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects } from "@/lib/services/subject-service";
import {
  getQuestionStats,
  getSubjectVerificationStats,
} from "@/lib/services/question-service";
import { getMockTests } from "@/lib/services/mock-test-service";
import { getUsers } from "@/lib/services/user-service";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [verifiedQuestions, setVerifiedQuestions] = useState(0);
  const [unverifiedQuestions, setUnverifiedQuestions] = useState(0);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectStats, setSubjectStats] = useState<
    Record<string, { total: number; verified: number; unverified: number }>
  >({});
  const [mockTestCount, setMockTestCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [qStats, examList, subList, mockList, userList] = await Promise.all([
        getQuestionStats(),
        getExams(true),
        getSubjects(true),
        getMockTests(),
        getUsers(100),
      ]);

      setTotalQuestions(qStats.totalCount);
      setVerifiedQuestions(qStats.verifiedCount);
      setUnverifiedQuestions(qStats.unverifiedCount);
      setExams(examList);
      setSubjects(subList);
      setMockTestCount(mockList.length);
      setUserCount(userList.length);

      const subIds = subList.map((s) => s.id);
      const stats = await getSubjectVerificationStats(subIds);
      setSubjectStats(stats);
    } catch (err) {
      console.error("Failed to load admin reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const verificationRate =
    totalQuestions > 0
      ? Math.round((verifiedQuestions / totalQuestions) * 100)
      : 0;

  const bcsSubjects = subjects
    .filter((s) => s.examId === "exam_bcs")
    .sort((a, b) => (subjectStats[b.id]?.total || 0) - (subjectStats[a.id]?.total || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System & Syllabus Reports (সিস্টেম রিপোর্ট ও ভেরিফিকেশন স্ট্যাটাস)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live Firestore inventory of manually verified questions, pending review queue, and syllabus coverage.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadReports}
          disabled={loading}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Live Counts
        </Button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Published Questions</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">
              {loading ? "..." : totalQuestions.toLocaleString()}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Manually Verified (ভেরিফাইড)</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : `${verifiedQuestions.toLocaleString()} (${verificationRate}%)`}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <Link
          href="/admin/questions?verified=false"
          className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 p-5 shadow-xs flex items-center justify-between transition-colors"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Review (রিভিউ প্রয়োজন)</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
              {loading ? "..." : unverifiedQuestions.toLocaleString()}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </Link>

        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Candidates / Mock Tests</p>
            <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
              {loading ? "..." : `${userCount} / ${mockTestCount}`}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* BCS Syllabus Subject Verification Breakdown */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              BCS Preliminary Syllabus & Verification Breakdown (বিষয়ভিত্তিক ভেরিফিকেশন রিপোর্ট)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click &ldquo;Review Unverified&rdquo; on any subject to jump straight into manual verification for that subject.
            </p>
          </div>
          <Link href="/admin/questions">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              Open Verification Workbench
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Computing live subject verification stats from Firestore...
          </div>
        ) : (
          <div className="space-y-3">
            {bcsSubjects.map((sub) => {
              const s = subjectStats[sub.id] || { total: 0, verified: 0, unverified: 0 };
              const subVerifyPct =
                s.total > 0 ? Math.round((s.verified / s.total) * 100) : 0;

              return (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({s.total.toLocaleString()} total)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        ভেরিফাইড: {s.verified.toLocaleString()} ({subVerifyPct}%)
                      </span>
                      <span className="text-amber-700 dark:text-amber-400 font-semibold">
                        রিভিউ বাকি: {s.unverified.toLocaleString()}
                      </span>
                      <Link
                        href={`/admin/questions?subjectId=${sub.id}&verified=${
                          s.unverified > 0 ? "false" : ""
                        }`}
                        className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 transition-colors"
                      >
                        {s.unverified > 0 ? "রিভিউ করুন →" : "দেখুন →"}
                      </Link>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${subVerifyPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
