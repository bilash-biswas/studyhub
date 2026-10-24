"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  ShieldCheck,
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
  getSubjectQuestionCounts,
} from "@/lib/services/question-service";
import { getMockTests } from "@/lib/services/mock-test-service";
import { getUsers } from "@/lib/services/user-service";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [verifiedQuestions, setVerifiedQuestions] = useState(0);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
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
      setExams(examList);
      setSubjects(subList);
      setMockTestCount(mockList.length);
      setUserCount(userList.length);

      const subIds = subList.map((s) => s.id);
      const counts = await getSubjectQuestionCounts(subIds);
      setSubjectCounts(counts);
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
    .sort((a, b) => (subjectCounts[b.id] || 0) - (subjectCounts[a.id] || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System & Syllabus Reports (সিস্টেম রিপোর্ট)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live Firestore inventory of verified questions, syllabus coverage, mock exams, and registered candidates.
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
            <p className="text-xs font-medium text-slate-500">Admin Verified (ভেরিফাইড)</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : `${verifiedQuestions.toLocaleString()} (${verificationRate}%)`}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Published Mock Exams</p>
            <h3 className="text-2xl font-bold mt-1 text-sky-600 dark:text-sky-400">
              {loading ? "..." : mockTestCount}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <FileCheck2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Registered Candidates</p>
            <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
              {loading ? "..." : userCount}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* BCS Syllabus Subject Distribution */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              BCS Preliminary Syllabus Distribution (বিষয়ভিত্তিক প্রশ্ন সংখ্যা)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exact Firestore question counts across all 10 BPSC preliminary subjects.
            </p>
          </div>
          <Link href="/admin/questions">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              Manage Questions
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Computing live subject counts from Firestore...
          </div>
        ) : (
          <div className="space-y-3">
            {bcsSubjects.map((sub) => {
              const count = subjectCounts[sub.id] || 0;
              const pct =
                totalQuestions > 0
                  ? Math.round((count / totalQuestions) * 100)
                  : 0;

              return (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({sub.id})
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {count.toLocaleString()} questions ({pct}%)
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4F46E5] dark:bg-[#818CF8] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, pct * 3)}%` }}
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
