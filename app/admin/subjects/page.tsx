"use client";

import React, { useState, useEffect } from "react";
import { Subject, Exam } from "@/types";
import {
  getSubjects,
  createSubject,
  updateSubject,
} from "@/lib/services/subject-service";
import { getExams } from "@/lib/services/exam-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [examId, setExamId] = useState("exam_bcs");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [subList, examList] = await Promise.all([
      getSubjects(true),
      getExams(true),
    ]);
    setSubjects(subList);
    setExams(examList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const examMap = new Map(exams.map((e) => [e.id, e.name]));

  const handleToggleStatus = async (sub: Subject) => {
    try {
      await updateSubject(sub.id, { isActive: !sub.isActive });
      setSubjects((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (err) {
      console.error("Failed to toggle subject status:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !examId) {
      setErrorMsg("Subject Name and Exam Track are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await createSubject({
        examId,
        name: name.trim(),
        description: description.trim(),
        order: Number(order) || 1,
        isActive: true,
      });

      setShowAddModal(false);
      setName("");
      setDescription("");
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create subject.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    if (selectedExamId !== "all" && s.examId !== selectedExamId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Subject Curricula Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage syllabus subjects, descriptions, and ordering per exam track.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="text-xs gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Subject
        </Button>
      </div>

      {/* Filter by Exam */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedExamId("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            selectedExamId === "all"
              ? "bg-[#4F46E5] text-white shadow-xs"
              : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          All Exams ({subjects.length})
        </button>

        {exams.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => setSelectedExamId(ex.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedExamId === ex.id
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Subjects List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading subjects...
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
          No subjects found for this category.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSubjects.map((sub) => {
              const exName = examMap.get(sub.examId) || "General Exam";

              return (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {exName}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </h3>
                    </div>

                    {sub.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        sub.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {sub.isActive ? "Active" : "Disabled"}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(sub)}
                      className="text-xs h-7"
                    >
                      {sub.isActive ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Add New Subject
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
                <label className="font-semibold block mb-1">
                  Subject Name (English)
                </label>
                <Input
                  placeholder="e.g. Bangladesh Affairs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Display Order</label>
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <Input
                  placeholder="e.g. National geography, constitution, history, liberation war"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs"
                />
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
                  {isSubmitting ? "Saving..." : "Create Subject"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
