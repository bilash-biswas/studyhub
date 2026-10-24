"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Exam, Subject } from "@/types";
import { getExams } from "@/lib/services/exam-service";
import { getSubjectsByExamId } from "@/lib/services/subject-service";
import { useLanguage } from "@/lib/context/language-context";
import { BCS_BATCHES } from "@/lib/constants/bcs-batches";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function PracticeSetupPage() {
  const router = useRouter();
  const { lang, t, n } = useLanguage();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuration State
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedBatchTag, setSelectedBatchTag] = useState<string>("");
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
      if (selectedExamId !== "exam_bcs") {
        setSelectedBatchTag("");
      }
    }
    loadSubjects();
  }, [selectedExamId]);

  const handleStartPractice = () => {
    if (!selectedExamId) {
      setErrorMsg(t("অনুশীলন শুরু করতে একটি পরীক্ষা নির্বাচন করুন।", "Please select an exam to practice."));
      return;
    }

    const sessionId = `prac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionConfig = {
      examId: selectedExamId,
      subjectId: selectedSubjectId || undefined,
      batchTag: selectedExamId === "exam_bcs" && selectedBatchTag ? selectedBatchTag : undefined,
      difficulty: selectedDifficulty,
      count: questionCount,
      feedbackMode,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionConfig));
    }

    router.push(`/practice/${sessionId}`);
  };

  const handleQuickPreset = (
    examSlug: string,
    subjectId?: string,
    count: number = 10,
    batchTag?: string
  ) => {
    const targetExam = exams.find((e) => e.slug === examSlug) || exams[0];
    if (!targetExam) return;

    const sessionId = `prac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionConfig = {
      examId: targetExam.id,
      subjectId: subjectId || undefined,
      batchTag: batchTag || undefined,
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
          {t("কাস্টম এমসিকিউ অনুশীলন", "Custom MCQ Practice")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t(
            "আপনার লক্ষ্য পরীক্ষা, বিসিএস ব্যাচ, বিষয় এবং ফিডব্যাক মোড নির্বাচন করে তাৎক্ষণিক অনুশীলন শুরু করুন।",
            "Select your target exam, BCS batch, subject, and learning mode to begin targeted practice."
          )}
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
          <CardTitle className="text-lg">
            {t("অনুশীলন সেশন সাজান", "Configure Your Session")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t(
              "তাৎক্ষণিক ব্যাখ্যাসহ অনুশীলন করুন অথবা পরীক্ষার পরিবেশে নিজেকে যাচাই করুন।",
              "Practice at your own pace with instant feedback or simulated exam conditions."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exam, BCS Batch & Subject Selection */}
          <div className={`grid grid-cols-1 ${selectedExamId === "exam_bcs" ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
            <div className="space-y-1.5">
              <Label htmlFor="examSelect">
                {t("লক্ষ্য পরীক্ষা (Target Exam)", "Target Examination")}
              </Label>
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

            {selectedExamId === "exam_bcs" && (
              <div className="space-y-1.5">
                <Label htmlFor="batchSelect">
                  {t("বিসিএস ব্যাচ (১০ম–৫০তম)", "BCS Batch (10th–50th)")}
                </Label>
                <select
                  id="batchSelect"
                  value={selectedBatchTag}
                  onChange={(e) => setSelectedBatchTag(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/70 focus:border-indigo-600"
                >
                  {BCS_BATCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {lang === "bn" ? b.labelBn : b.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="subjectSelect">
                {t("বিষয় (Subject)", "Subject")}
              </Label>
              <select
                id="subjectSelect"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/70 focus:border-indigo-600"
              >
                <option value="">
                  {t("সব বিষয় (সমগ্র পাঠ্যক্রম)", "All Subjects (Full Syllabus)")}
                </option>
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
              <Label>{t("কাঠিন্যের স্তর (Difficulty)", "Difficulty Level")}</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "all", label: t("সব", "All") },
                  { id: "easy", label: t("সহজ", "Easy") },
                  { id: "medium", label: t("মধ্যম", "Med") },
                  { id: "hard", label: t("কঠিন", "Hard") },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(item.id)}
                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
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
              <Label>{t("প্রশ্ন সংখ্যা (Question Count)", "Questions Count")}</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      questionCount === num
                        ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5] dark:bg-[#312E81] dark:border-[#818CF8] dark:text-[#A5B4FC]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {n(num)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Mode */}
          <div className="space-y-2">
            <Label>{t("ফিডব্যাক মোড", "Practice Feedback Mode")}</Label>
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
                  {t("ইনস্ট্যান্ট ফিডব্যাক মোড (প্রস্তাবিত)", "Instant Feedback Mode (Recommended)")}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t(
                    "প্রতিটি অপশনে ক্লিক করার সাথে সাথে সঠিক উত্তর, বিস্তারিত বাংলা ব্যাখ্যা ও গাণিতিক সূত্র দেখায়।",
                    "Reveals the correct answer, Bengali explanation, and formulas immediately as you click each option."
                  )}
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
                  {t("পরীক্ষা মোড (Exam-Style)", "Exam-Style Mode")}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t(
                    "সম্পূর্ণ সেট সাবমিট না করা পর্যন্ত উত্তর লুকানো থাকে। শেষে পূর্ণাঙ্গ ফলাফল ও সমাধান দেখায়।",
                    "Hides answers until you submit the entire set. Simulates test conditions with answer review at the end."
                  )}
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
              {t("অনুশীলন শুরু করুন", "Start Practice Session")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick-Start Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {t("দ্রুত অনুশীলন প্রিসেট", "Quick Practice Presets")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => handleQuickPreset("bcs", undefined, 20, "46th-bcs")}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-1 shadow-xs"
          >
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              {t("৪৬তম বিসিএস", "46th BCS")}
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t("৪৬তম বিসিএস প্রিলিমিনারি র‍্যাপিড ড্রিল", "46th BCS Preliminary Rapid Drill")}
            </h4>
            <p className="text-[11px] text-slate-400">
              {t("২০টি প্রশ্ন • ইনস্ট্যান্ট মোড", "20 Questions • Instant Mode")}
            </p>
          </div>

          <div
            onClick={() => handleQuickPreset("bcs", "sub_bcs_math", 10)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-1 shadow-xs"
          >
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              {t("বিসিএস গণিত", "BCS Math")}
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t("গাণিতিক যুক্তি ও সমীকরণ (KaTeX)", "Algebra & Equations KaTeX")}
            </h4>
            <p className="text-[11px] text-slate-400">
              {t("১০টি প্রশ্ন • ইনস্ট্যান্ট মোড", "10 Questions • Instant Mode")}
            </p>
          </div>

          <div
            onClick={() => handleQuickPreset("bcs", "sub_bcs_english", 10)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-1 shadow-xs"
          >
            <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">
              {t("বিসিএস ইংরেজি", "BCS English")}
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t("English Grammar & Literature", "English Grammar & Literature")}
            </h4>
            <p className="text-[11px] text-slate-400">
              {t("১০টি প্রশ্ন • ইনস্ট্যান্ট মোড", "10 Questions • Instant Mode")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
