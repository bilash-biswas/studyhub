"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HelpCircle,
  Check,
  Plus,
  Trash2,
  Eye,
  Upload,
  AlertCircle,
  Save,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Question, Exam, Subject } from "@/types";
import { questionSchema, QuestionFormData } from "@/lib/validations/question";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects, getSubjectsByExamId } from "@/lib/services/subject-service";
import { createQuestion, updateQuestion } from "@/lib/services/question-service";
import { uploadQuestionImage } from "@/lib/firebase/storage";
import { useAuth } from "@/hooks/useAuth";
import { MathText } from "@/components/ui/math-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface QuestionFormProps {
  initialQuestion?: Question;
  isEdit?: boolean;
}

export function QuestionForm({ initialQuestion, isEdit = false }: QuestionFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagsInput, setTagsInput] = useState(initialQuestion?.tags.join(", ") || "");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialQuestion?.imageUrl || null
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      examId: initialQuestion?.examId || "",
      subjectId: initialQuestion?.subjectId || "",
      question: initialQuestion?.question || "",
      options: initialQuestion?.options?.length
        ? initialQuestion.options.map((o, idx) => ({
            id: o.id && o.id.length <= 2 ? o.id : String.fromCharCode(97 + idx),
            text: o.text || "",
          }))
        : [
            { id: "a", text: "" },
            { id: "b", text: "" },
            { id: "c", text: "" },
            { id: "d", text: "" },
          ],
      correctOptionId: initialQuestion?.correctOptionId || "a",
      explanation: initialQuestion?.explanation || "",
      difficulty: initialQuestion?.difficulty || "medium",
      year: initialQuestion?.year || new Date().getFullYear(),
      source: initialQuestion?.source || "",
      tags: initialQuestion?.tags || ["general"],
      imageUrl: initialQuestion?.imageUrl || null,
      status: initialQuestion?.status || "published",
      adminVerified: initialQuestion?.adminVerified ?? false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const selectedExamId = watch("examId");
  const watchQuestion = watch("question");
  const watchOptions = watch("options") || [];
  const watchExplanation = watch("explanation");
  const watchCorrectOptionId = watch("correctOptionId");
  const watchAdminVerified = watch("adminVerified");

  // Keep form in sync when initialQuestion is loaded or updated
  useEffect(() => {
    if (initialQuestion) {
      reset({
        examId: initialQuestion.examId || "",
        subjectId: initialQuestion.subjectId || "",
        question: initialQuestion.question || "",
        options: initialQuestion.options?.length
          ? initialQuestion.options.map((o, idx) => ({
              id: o.id && o.id.length <= 2 ? o.id : String.fromCharCode(97 + idx),
              text: o.text || "",
            }))
          : [
              { id: "a", text: "" },
              { id: "b", text: "" },
              { id: "c", text: "" },
              { id: "d", text: "" },
            ],
        correctOptionId: initialQuestion.correctOptionId || "a",
        explanation: initialQuestion.explanation || "",
        difficulty: initialQuestion.difficulty || "medium",
        year: initialQuestion.year || new Date().getFullYear(),
        source: initialQuestion.source || "",
        tags: initialQuestion.tags || ["general"],
        imageUrl: initialQuestion.imageUrl || null,
        status: initialQuestion.status || "published",
        adminVerified: initialQuestion.adminVerified ?? false,
      });
      setTagsInput(initialQuestion.tags?.join(", ") || "");
      setImagePreviewUrl(initialQuestion.imageUrl || null);
    }
  }, [initialQuestion, reset]);

  // Load active exams & auto-sync examId
  useEffect(() => {
    async function fetchCatalogs() {
      setLoadingCatalogs(true);
      const examList = await getExams(true);
      setExams(examList);

      const currentExamId = getValues("examId");
      if (!currentExamId && initialQuestion?.examId) {
        setValue("examId", initialQuestion.examId);
      } else if (!currentExamId && examList.length > 0) {
        const isBcs = initialQuestion?.id?.startsWith("bcs_") || initialQuestion?.tags?.some((t) => t.includes("bcs"));
        if (isBcs) {
          const bcsExam = examList.find(
            (e) => e.slug === "bcs" || e.id === "bcs" || e.name.toLowerCase().includes("bcs")
          );
          if (bcsExam) {
            setValue("examId", bcsExam.id);
          }
        }
      }
      setLoadingCatalogs(false);
    }
    fetchCatalogs();
  }, [initialQuestion, setValue, getValues]);

  // Filter subjects when examId changes & auto-sync subjectId
  useEffect(() => {
    async function fetchSubjects() {
      const examIdToUse = selectedExamId || initialQuestion?.examId;
      let subList: Subject[] = [];
      if (examIdToUse) {
        subList = await getSubjectsByExamId(examIdToUse, true);
      }
      if (subList.length === 0) {
        subList = await getSubjects(true);
      }
      setSubjects(subList);

      const currentSubId = getValues("subjectId");
      if (!currentSubId && initialQuestion?.subjectId) {
        setValue("subjectId", initialQuestion.subjectId);
      } else if (!currentSubId && subList.length > 0 && initialQuestion?.tags) {
        const matched = subList.find((s) =>
          initialQuestion.tags.some(
            (t) => t === s.id || s.name.toLowerCase().includes(t)
          )
        );
        if (matched) {
          setValue("subjectId", matched.id);
        }
      }
    }
    fetchSubjects();
  }, [selectedExamId, initialQuestion, setValue, getValues]);

  // Handle Tag Input Change
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTagsInput(raw);
    const parsed = raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    setValue("tags", parsed.length > 0 ? parsed : ["general"], { shouldValidate: true });
  };

  // Handle Image File Selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Image must be smaller than 5 MB");
        return;
      }
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: QuestionFormData) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      let finalImageUrl = data.imageUrl || null;

      // Handle image upload if a file was selected
      if (selectedImageFile) {
        const questionId = initialQuestion?.id || `q_${Date.now()}`;
        finalImageUrl = await uploadQuestionImage(selectedImageFile, questionId);
      }

      if (isEdit && initialQuestion) {
        await updateQuestion(initialQuestion.id, {
          examId: data.examId,
          subjectId: data.subjectId,
          question: data.question,
          options: data.options,
          correctOptionId: data.correctOptionId,
          explanation: data.explanation,
          difficulty: data.difficulty,
          year: data.year ?? undefined,
          source: data.source,
          tags: data.tags,
          status: data.status,
          adminVerified: Boolean(data.adminVerified),
          imageUrl: finalImageUrl,
          updatedBy: user?.uid || "admin",
        });
      } else {
        await createQuestion({
          examId: data.examId,
          subjectId: data.subjectId,
          question: data.question,
          options: data.options,
          correctOptionId: data.correctOptionId,
          explanation: data.explanation,
          difficulty: data.difficulty,
          year: data.year ?? undefined,
          source: data.source,
          tags: data.tags,
          status: data.status,
          adminVerified: Boolean(data.adminVerified),
          imageUrl: finalImageUrl,
          createdBy: user?.uid || "admin",
          updatedBy: user?.uid || "admin",
        });
      }

      router.push("/admin/questions");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving question:", err);
      setFormError(err?.message || "Failed to save question. Please check all fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-2 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Questions
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {isEdit ? "Edit Question" : "Create New Question"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supports Bengali Unicode, options A-D, and KaTeX LaTeX equations ($...$ and $$...$$).
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
          className="text-xs gap-1.5"
        >
          <Eye className="h-4 w-4" />
          {previewMode ? "Hide Live Preview" : "Show Live Preview"}
        </Button>
      </div>

      {formError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <p className="flex-1">{formError}</p>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Question Content</CardTitle>
                <CardDescription className="text-xs">
                  Enter the question prompt. Use $...$ for inline math (e.g. $x^2$) and $$...$$ for block math.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question Prompt */}
                <div className="space-y-1.5">
                  <Label htmlFor="question">
                    Question Prompt <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="question"
                    rows={4}
                    placeholder="Enter question text here. e.g. যদি $x + \frac{1}{x} = 3$ হয়, তবে $x^3 + \frac{1}{x^3}$ এর মান কত?"
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-950/70 dark:focus:border-indigo-400 ${
                      errors.question ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    }`}
                    {...register("question")}
                  />
                  {errors.question && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.question.message}
                    </p>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Answer Options <span className="text-red-500">*</span> (Select radio for correct answer)
                    </Label>
                    <span className="text-xs text-slate-500">Min 2, Max 6</span>
                  </div>

                  <div className="space-y-2.5">
                    {fields.map((field, index) => {
                      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
                      const optionId = watchOptions[index]?.id || String.fromCharCode(97 + index); // a, b, c, d...
                      const isCorrect = watchCorrectOptionId === optionId;
                      return (
                        <div
                          key={field.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                            isCorrect
                              ? "bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800"
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {/* Radio for Correct Answer */}
                          <input
                            type="radio"
                            name="correctOptionRadio"
                            checked={isCorrect}
                            onChange={() => setValue("correctOptionId", optionId, { shouldValidate: true })}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                            title={`Mark Option ${optionLetter} as correct`}
                          />

                          {/* Option Badge */}
                          <span
                            className={`h-6 w-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 uppercase transition-colors ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {optionLetter}
                          </span>

                          {/* Hidden input to ensure options[index].id is preserved on submit */}
                          <input
                            type="hidden"
                            {...register(`options.${index}.id` as const)}
                            value={optionId}
                          />

                          {/* Option Input */}
                          <Input
                            placeholder={`Option ${optionLetter} text (e.g. $18$ or বাংলা উত্তর)`}
                            className="h-9 text-xs flex-1 min-w-0"
                            {...register(`options.${index}.text` as const)}
                          />

                          {/* Delete Option (only if > 2 options) */}
                          {fields.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                remove(index);
                                if (watchCorrectOptionId === optionId) {
                                  const remaining = watchOptions.filter((_, i) => i !== index);
                                  if (remaining.length > 0) {
                                    setValue("correctOptionId", remaining[0]?.id || "a", { shouldValidate: true });
                                  }
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
                              title="Remove option"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {errors.options && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.options.message}
                    </p>
                  )}

                  {fields.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const nextId = String.fromCharCode(97 + fields.length); // e, f
                        append({ id: nextId, text: "" });
                      }}
                      className="text-xs gap-1 mt-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Option
                    </Button>
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="explanation">Detailed Explanation / সমাধান (Optional)</Label>
                  <textarea
                    id="explanation"
                    rows={3}
                    placeholder="Explain why the answer is correct with formulas or rules. e.g. আমরা জানি, $a^3 + b^3 = \dots$"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 dark:focus:ring-indigo-950/70"
                    {...register("explanation")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Metadata & Classification</CardTitle>
                <CardDescription className="text-xs">
                  Categorize this question for syllabus tracking and mock tests.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Exam & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="examId">
                      Exam Category <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="examId"
                      className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 dark:focus:ring-indigo-950/70"
                      {...register("examId")}
                    >
                      <option value="">Select Exam</option>
                      {exams.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.name}
                        </option>
                      ))}
                    </select>
                    {errors.examId && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.examId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subjectId">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="subjectId"
                      disabled={!selectedExamId || subjects.length === 0}
                      className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 dark:focus:ring-indigo-950/70 disabled:opacity-50"
                      {...register("subjectId")}
                    >
                      <option value="">
                        {!selectedExamId ? "Select Exam First" : "Select Subject"}
                      </option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    {errors.subjectId && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.subjectId.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Difficulty, Status, Year */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                      {...register("difficulty")}
                    >
                      <option value="easy">Easy (সহজ)</option>
                      <option value="medium">Medium (মাঝারি)</option>
                      <option value="hard">Hard (কঠিন)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status">Publish Status</Label>
                    <select
                      id="status"
                      className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                      {...register("status")}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="year">Year (Optional)</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="e.g. 2024"
                      {...register("year", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Source & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="source">Question Source (Optional)</Label>
                    <Input
                      id="source"
                      placeholder="e.g. 45th BCS Preliminary"
                      {...register("source")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tags">Tags (Comma-separated)</Label>
                    <Input
                      id="tags"
                      value={tagsInput}
                      onChange={handleTagsChange}
                      placeholder="e.g. networking, subnetting, ipv4"
                    />
                    {errors.tags && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.tags.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Optional Image Upload */}
                <div className="space-y-1.5 pt-2">
                  <Label>Attach Diagram / Image (Optional, max 5 MB)</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageFileChange}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/60 dark:file:text-indigo-300"
                    />
                    {imagePreviewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImageFile(null);
                          setImagePreviewUrl(null);
                          setValue("imageUrl", null);
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Admin Manual Verification Status Toggle */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                    watchAdminVerified
                      ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {watchAdminVerified ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {watchAdminVerified
                          ? "অ্যাডমিন ভেরিফাইড (Manually Verified)"
                          : "রিভিউ প্রয়োজন (Unverified / Needs Admin Review)"}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        প্রশ্ন, অপশন, সঠিক উত্তর ও বিষয় সঠিক থাকলে ভেরিফাইড হিসেবে চিহ্নিত করুন।
                      </p>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(watchAdminVerified)}
                      onChange={(e) =>
                        setValue("adminVerified", e.target.checked, { shouldValidate: true })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>ভেরিফাইড (Verified)</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/admin/questions")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                isLoading={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isEdit ? "Update Question" : "Save Question"}
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={isSubmitting}
                onClick={() => {
                  setValue("adminVerified", true, { shouldValidate: true });
                  handleSubmit(onSubmit)();
                }}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <ShieldCheck className="h-4 w-4" />
                সেভ ও ভেরিফাই করুন (Save & Verify)
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel (1 Column) */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Live Candidate Preview
            </h3>

            <Card className="border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="p-5 space-y-4">
                {/* Question Text */}
                <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed min-h-[40px]">
                  {watchQuestion ? (
                    <MathText text={watchQuestion} />
                  ) : (
                    <span className="text-slate-400 italic text-xs">
                      Question prompt will render here with KaTeX formulas...
                    </span>
                  )}
                </div>

                {/* Image Preview */}
                {imagePreviewUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                    <img src={imagePreviewUrl} alt="Question preview" className="max-h-48 object-contain" />
                  </div>
                )}

                {/* Options Preview */}
                <div className="space-y-2">
                  {watchOptions.map((opt, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx);
                    const isCorrect = watchCorrectOptionId === opt.id;
                    return (
                      <div
                        key={opt.id || idx}
                        className={`p-2.5 rounded-lg border text-xs sm:text-sm flex items-center gap-2.5 transition-colors ${
                          isCorrect
                            ? "bg-[#ECFDF5] border-[#10B981] text-[#047857] dark:bg-[#064E3B]/60 dark:border-[#34D399] dark:text-[#A7F3D0] font-medium"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 uppercase ${
                            isCorrect
                              ? "bg-[#10B981] text-white dark:bg-[#34D399] dark:text-[#0F172A]"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <div className="flex-1 min-w-0">
                          {opt.text ? (
                            <MathText text={opt.text} />
                          ) : (
                            <span className="text-slate-400 italic text-xs">Option {optionLetter}</span>
                          )}
                        </div>
                        {isCorrect && (
                          <Check className="h-4 w-4 shrink-0 text-[#10B981] dark:text-[#34D399]" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Preview */}
                {watchExplanation && (
                  <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400 block mb-1">
                      Explanation Preview:
                    </span>
                    <MathText text={watchExplanation} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
