"use client";

import React, { useState, useEffect } from "react";
import { MockTest, Exam } from "@/types";
import {
  getMockTests,
  createMockTest,
  updateMockTest,
  seedSampleMockTests,
} from "@/lib/services/mock-test-service";
import { getExams } from "@/lib/services/exam-service";
import { getQuestions } from "@/lib/services/question-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileCheck2,
  PlusCircle,
  AlertTriangle,
  Timer,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function AdminMockTestsPage() {
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [examId, setExamId] = useState("exam_bcs");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [correctMark, setCorrectMark] = useState(1.0);
  const [wrongMark, setWrongMark] = useState(0.5);
  const [passPercentage, setPassPercentage] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [testList, examList] = await Promise.all([
      getMockTests(),
      getExams(true),
    ]);
    setMockTests(testList);
    setExams(examList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const examMap = new Map(exams.map((e) => [e.id, e.name]));

  const handleTogglePublish = async (test: MockTest) => {
    try {
      await updateMockTest(test.id, { isPublished: !test.isPublished });
      setMockTests((prev) =>
        prev.map((t) => (t.id === test.id ? { ...t, isPublished: !t.isPublished } : t))
      );
    } catch (err) {
      console.error("Failed to toggle mock test status:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !examId) {
      setErrorMsg("Title and Target Exam Track are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // Pick random published questions for this exam
      const qRes = await getQuestions({ examId, status: "published" }, totalQuestions);
      const questionIds = qRes.questions.map((q) => q.id);

      await createMockTest({
        examId,
        title: title.trim(),
        description: description.trim(),
        durationMinutes: Number(durationMinutes) || 30,
        totalQuestions: Number(totalQuestions) || 20,
        questionIds,
        correctMark: Number(correctMark) || 1.0,
        wrongMark: Number(wrongMark) || 0,
        passPercentage: Number(passPercentage) || 50,
        isPublished: true,
      });

      setShowAddModal(false);
      setTitle("");
      setDescription("");
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create mock test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Mock Tests Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure timed model exams, durations, negative marking penalties, and question sets.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="text-xs gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Create Mock Test
        </Button>
      </div>

      {/* Tests Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading mock tests...
        </div>
      ) : mockTests.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
          No mock tests configured yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockTests.map((t) => {
              const exName = examMap.get(t.examId) || "Competitive Exam";

              return (
                <div
                  key={t.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {exName}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-medium text-slate-500">
                        {t.durationMinutes} mins
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-medium text-slate-500">
                        {t.totalQuestions} Questions
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {t.title}
                    </h3>

                    {t.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span>Marking: +{t.correctMark} / -{t.wrongMark}</span>
                      <span>Pass: {t.passPercentage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        t.isPublished
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {t.isPublished ? "Published" : "Draft"}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(t)}
                      className="text-xs h-7"
                    >
                      {t.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Mock Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create New Mock Test
            </h2>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  Target Exam Track
                </label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Test Title</label>
                <Input
                  placeholder="e.g. 47th BCS Preliminary Grand Model Test"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <Input
                  placeholder="e.g. Full-length model test covering all 10 preliminary subjects"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">
                    Duration (Minutes)
                  </label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Total Questions
                  </label>
                  <Input
                    type="number"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">
                    Correct Mark
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={correctMark}
                    onChange={(e) => setCorrectMark(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Negative Penalty
                  </label>
                  <Input
                    type="number"
                    step="0.05"
                    value={wrongMark}
                    onChange={(e) => setWrongMark(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs"
                >
                  {isSubmitting ? "Saving..." : "Create Test"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
