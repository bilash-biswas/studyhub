"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MockTest, Exam } from "@/types";
import {
  getMockTests,
  seedSampleMockTests,
} from "@/lib/services/mock-test-service";
import { getExams } from "@/lib/services/exam-service";
import { getQuestions } from "@/lib/services/question-service";
import { useLanguage } from "@/lib/context/language-context";
import { Button } from "@/components/ui/button";
import {
  Timer,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Search,
} from "lucide-react";

export default function MockExamsCatalogPage() {
  const router = useRouter();
  const { t, n } = useLanguage();

  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const [testList, examList] = await Promise.all([
          getMockTests(),
          getExams(),
        ]);

        setExams(examList);

        if (testList.length === 0) {
          // Auto-seed sample tests
          const qRes = await getQuestions({ status: "published" }, 50);
          const qIds = qRes.questions.map((q) => q.id);
          await seedSampleMockTests(qIds);
          const seeded = await getMockTests();
          setMockTests(seeded);
        } else {
          setMockTests(testList);
        }
      } catch (err) {
        console.error("Error loading mock test catalog:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const examMap = new Map(exams.map((e) => [e.id, e.name]));

  const filteredTests = mockTests
    .filter((t) => {
      if (selectedExamId !== "all" && t.examId !== selectedExamId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || "").toLowerCase().includes(q);
        const matchesId = t.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesId) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const numA = parseInt((a.id.match(/\d+/) || ["0"])[0], 10);
      const numB = parseInt((b.id.match(/\d+/) || ["0"])[0], 10);
      if (numA && numB) return numB - numA;
      return b.totalQuestions - a.totalQuestions;
    });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading competitive mock tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Timer className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {t("পরীক্ষা সিমুলেশন", "Exam Simulation")}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("টাইমড মডেল টেস্ট", "Timed Mock Exams")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t(
              "কাউন্টডাউন টাইমার, নেগেটিভ মার্কিং এবং তাৎক্ষণিক ফলাফলসহ বিসিএস প্রিলিমিনারি ও ব্যাংক পরীক্ষার পূর্ণাঙ্গ সিমুলেশন।",
              "Simulate actual BCS Preliminary and Bank exams with countdown timers, negative marking, and instant evaluation."
            )}
          </p>
        </div>

        <Button
          onClick={() => router.push("/practice")}
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />
          {t("কাস্টম অনুশীলন", "Custom Practice")}
        </Button>
      </div>

      {/* Filter Tabs by Exam */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedExamId("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            selectedExamId === "all"
              ? "bg-[#4F46E5] text-white shadow-xs"
              : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
          }`}
        >
          {t(`সব পরীক্ষা (${n(mockTests.length)})`, `All Exams (${mockTests.length})`)}
        </button>

        {exams.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => setSelectedExamId(ex.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedExamId === ex.id
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              "বিসিএস ব্যাচ, সাল বা পরীক্ষার নাম দিয়ে খুঁজুন (যেমন: 46th, 10th)...",
              "Search BCS batches, years, or exam titles (e.g. 46th, 10th)..."
            )}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {t("প্রদর্শিত হচ্ছে", "Showing")}{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{n(filteredTests.length)}</span>{" "}
          {t("টি মডেল টেস্ট", "examinations")}
        </div>
      </div>

      {/* Mock Tests Grid */}
      {filteredTests.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
          No mock exams available for the selected category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => {
            const examName = examMap.get(test.examId) || "Competitive Exam";

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {examName}
                    </span>

                    {/* Negative marking badge */}
                    {test.wrongMark > 0 ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        -{test.wrongMark} Negative Marking
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        No Negative Mark
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                      {test.title}
                    </h3>
                    {test.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {test.description}
                      </p>
                    )}
                  </div>

                  {/* Meta Specs */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {n(test.durationMinutes)}m
                      </div>
                      <div className="text-[11px] text-slate-500">{t("সময়", "Duration")}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {n(test.totalQuestions)}
                      </div>
                      <div className="text-[11px] text-slate-500">{t("প্রশ্ন", "Questions")}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        +{test.correctMark} / -{test.wrongMark}
                      </div>
                      <div className="text-[11px] text-slate-500">{t("মার্কিং", "Marking")}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => router.push(`/exams/${test.id}`)}
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 shadow-xs"
                  >
                    <span>{t("পরীক্ষা শুরু করুন", "Take Mock Exam")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
