"use client";

import React, { useState, useEffect } from "react";
import { Exam } from "@/types";
import {
  getExams,
  createExam,
  updateExam,
} from "@/lib/services/exam-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderTree,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchExamsList = async () => {
    setLoading(true);
    const list = await getExams(true);
    setExams(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchExamsList();
  }, []);

  const handleToggleStatus = async (exam: Exam) => {
    try {
      await updateExam(exam.id, { isActive: !exam.isActive });
      setExams((prev) =>
        prev.map((e) => (e.id === exam.id ? { ...e, isActive: !e.isActive } : e))
      );
    } catch (err) {
      console.error("Failed to toggle exam status:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setErrorMsg("Exam Name and Slug are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await createExam({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        order: Number(order) || 1,
        isActive: true,
      });

      setShowAddModal(false);
      setName("");
      setSlug("");
      setDescription("");
      await fetchExamsList();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create exam track.");
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
            Exam Track Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure competitive target tracks (BCS, Bank Recruitment, Primary & Govt Jobs).
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="text-xs gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Exam Track
        </Button>
      </div>

      {/* Exams Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading exam categories...
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
          No exams configured yet. Click &quot;Add New Exam Track&quot; above.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
                      #{ex.order}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {ex.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-mono">
                        slug: /{ex.slug}
                      </div>
                    </div>
                  </div>

                  {ex.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-10">
                      {ex.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pl-10 sm:pl-0">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      ex.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {ex.isActive ? "Active" : "Disabled"}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(ex)}
                    className="text-xs h-7"
                  >
                    {ex.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Add New Exam Track
            </h2>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  Exam Name (English)
                </label>
                <Input
                  placeholder="e.g. Primary Teacher Recruitment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Slug URL</label>
                  <Input
                    placeholder="e.g. primary-teacher"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Order</label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <Input
                  placeholder="e.g. Directorate of Primary Education DPE exam preparation"
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
                  {isSubmitting ? "Saving..." : "Create Exam"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
