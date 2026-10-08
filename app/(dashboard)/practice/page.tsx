"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  FolderTree,
  Zap,
  Clock,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Exam, Subject } from "@/types";
import { getExams } from "@/lib/services/exam-service";
import { getSubjectsByExamId } from "@/lib/services/subject-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function PracticeSetupPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuration State
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [feedbackMode, setFeedbackMode] = useState<"instant" | "exam">("instant");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalogs() {
      setLoading(true);
      const examList = await getExams();
      setExams(examList);
      if (examList.length > 0) {
        setSelectedExamId(examList[0].id);
      }
      setLoading(false);
    }
    loadCatalogs();
  }, []);

  useEffect(() => {
    async function loadSubjects() {
      if (!selectedExamId) {
        setSubjects([]);
        return;
      }
      const subList = await getSubjectsByExamId(selectedExamId);
      setSubjects(subList);
      setSelectedSubjectId(""); // reset to "all"
    }
    loadSubjects();
  }, [selectedExamId]);

  const handleStartPractice = () => {
    if (!selectedExamId) {
      setErrorMsg("Please select an exam to practice.");
      return;
    }

    const sessionId = `prac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionConfig = {
      examId: selectedExamId,
      subjectId: selectedSubjectId || undefined,
      difficulty: selectedDifficulty,
      count: questionCount,
      feedbackMode,
    };

    // Store configuration in sessionStorage to avoid permanent Firestore write overhead
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionConfig));
    }

    router.push(`/practice/${sessionId}`);
  };

  const handleQuickPreset = (examSlug: string, subjectId?: string, count: number = 10) => {
    const targetExam = exams.find((e) => e.slug === examSlug) || exams[0];
    if (!targetExam) return;

    const sessionId = `prac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionConfig = {
      examId: targetExam.id,
      subjectId: subjectId || undefined,
      difficulty: "all",
      count,
      feedbackMode: "instant",
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionConfig));
    }

    router.push(`/practice/${sessionId}`);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Sparkles className="h-7 w-7 text-[#4F46E5] dark:text-[#818CF8]" />
          Custom MCQ Practice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select your target exam, subject, and learning mode to begin targeted practice.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Configuration Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Configure Your Session</CardTitle>
          <CardDescription className="text-xs">
            Practice at your own pace with instant feedback or simulated exam conditions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exam & Subject Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="examSelect">Target Examination</Label>
              <select
                id="examSelect"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/70 focus:border-indigo-600"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subjectSelect">Subject</Label>
              <select
                id="subjectSelect"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/70 focus:border-indigo-600"
              >
                <option value="">All Subjects (সমগ্র পাঠ্যক্রম)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty & Number of Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Difficulty Level</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "easy", label: "Easy" },
                  { id: "medium", label: "Med" },
                  { id: "hard", label: "Hard" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(item.id)}
                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                      selectedDifficulty === item.id
                        ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5] dark:bg-[#312E81] dark:border-[#818CF8] dark:text-[#A5B4FC]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Questions Count</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                      questionCount === num
                        ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5] dark:bg-[#312E81] dark:border-[#818CF8] dark:text-[#A5B4FC]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Mode */}
          <div className="space-y-2">
            <Label>Practice Feedback Mode</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFeedbackMode("instant")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  feedbackMode === "instant"
                    ? "bg-[#EEF2FF] border-[#4F46E5] text-[#3730A3] dark:bg-[#312E81]/80 dark:border-[#818CF8] dark:text-[#E0E7FF] shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Zap className="h-4 w-4 text-[#4F46E5] dark:text-[#818CF8]" />
                  Instant Feedback Mode (Recommended)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Reveals the correct answer, Bengali explanation, and formulas immediately as you click each option. Ideal for active learning.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFeedbackMode("exam")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  feedbackMode === "exam"
                    ? "bg-[#EEF2FF] border-[#4F46E5] text-[#3730A3] dark:bg-[#312E81]/80 dark:border-[#818CF8] dark:text-[#E0E7FF] shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Clock className="h-4 w-4 text-[#4F46E5] dark:text-[#818CF8]" />
                  Exam-Style Mode
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Hides answers until you submit the entire set. Simulates test conditions with answer review at the end.
                </p>
              </button>
            </div>
          </div>

          {/* Start Action */}
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleStartPractice}
              className="gap-2 w-full sm:w-auto font-semibold"
            >
              Start Practice Session
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick-Start Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Quick Practice Presets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => handleQuickPreset("bcs", "sub_bcs_ict", 10)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-1 shadow-xs"
          >
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              BCS ICT
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Networking & Subnetting Rapid
            </h4>
            <p className="text-[11px] text-slate-400">10 Questions • Instant Mode</p>
          </div>

          <div
            onClick={() => handleQuickPreset("bcs", "sub_bcs_math", 10)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-1 shadow-xs"
          >
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              BCS Math
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Algebra & Equations KaTeX
            </h4>
            <p className="text-[11px] text-slate-400">10 Questions • Instant Mode</p>
          </div>

          <div
            onClick={() => handleQuickPreset("bank-job", undefined, 10)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-1 shadow-xs"
          >
            <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">
              Bank Recruitment
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Combined Banks Officer Mix
            </h4>
            <p className="text-[11px] text-slate-400">10 Questions • Instant Mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
