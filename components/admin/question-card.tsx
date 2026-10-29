"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { Question, QuestionDifficulty, Subject } from "@/types";
import { MathText } from "@/components/ui/math-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuestionCardProps {
  question: Question;
  examName?: string;
  subjectName?: string;
  allSubjects?: Subject[];
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onStatusChange?: (id: string, status: "draft" | "published" | "archived") => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onVerifyToggle?: (id: string, verified: boolean) => Promise<void>;
  onSubjectChange?: (id: string, newSubjectId: string) => Promise<void>;
  onInlineUpdate?: (
    id: string,
    updates: Partial<Question>,
    markVerified?: boolean
  ) => Promise<void>;
}

export function QuestionCard({
  question,
  examName,
  subjectName,
  allSubjects,
  selected = false,
  onToggleSelect,
  onStatusChange,
  onDelete,
  onVerifyToggle,
  onSubjectChange,
  onInlineUpdate,
}: QuestionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChangingSubject, setIsChangingSubject] = useState(false);

  // Inline Quick Edit State
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [isSavingInline, setIsSavingInline] = useState(false);
  const [editPrompt, setEditPrompt] = useState(question.question);
  const [editOptions, setEditOptions] = useState(
    question.options.map((o) => ({ ...o }))
  );
  const [editCorrectId, setEditCorrectId] = useState(question.correctOptionId);
  const [editExplanation, setEditExplanation] = useState(question.explanation || "");
  const [editDifficulty, setEditDifficulty] = useState<QuestionDifficulty>(
    question.difficulty || "medium"
  );
  const [editSubjectId, setEditSubjectId] = useState(question.subjectId);
  const [editSource, setEditSource] = useState(question.source || "");
  const [editTags, setEditTags] = useState((question.tags || []).join(", "));

  const difficultyColors = {
    easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    hard: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800",
  };

  const statusColors = {
    published: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    archived: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800",
  };

  const handleTogglePublish = async () => {
    if (!onStatusChange) return;
    setIsStatusChanging(true);
    const nextStatus = question.status === "published" ? "draft" : "published";
    await onStatusChange(question.id, nextStatus);
    setIsStatusChanging(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    await onDelete(question.id);
    setIsDeleting(false);
    setShowConfirmDelete(false);
  };

  const handleToggleVerify = async () => {
    if (!onVerifyToggle) return;
    setIsVerifying(true);
    await onVerifyToggle(question.id, !question.adminVerified);
    setIsVerifying(false);
  };

  const handleSubjectChange = async (newSubId: string) => {
    if (!onSubjectChange || newSubId === question.subjectId) return;
    setIsChangingSubject(true);
    await onSubjectChange(question.id, newSubId);
    setEditSubjectId(newSubId);
    setIsChangingSubject(false);
  };

  const openQuickEdit = () => {
    setEditPrompt(question.question);
    setEditOptions(question.options.map((o) => ({ ...o })));
    setEditCorrectId(question.correctOptionId);
    setEditExplanation(question.explanation || "");
    setEditDifficulty(question.difficulty || "medium");
    setEditSubjectId(question.subjectId);
    setEditSource(question.source || "");
    setEditTags((question.tags || []).join(", "));
    setIsQuickEditing(true);
  };

  const handleSaveInline = async (markVerified?: boolean) => {
    if (!onInlineUpdate) return;
    setIsSavingInline(true);
    try {
      const parsedTags = editTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const updates: Partial<Question> = {
        question: editPrompt.trim(),
        options: editOptions.map((o) => ({ id: o.id, text: o.text.trim() })),
        correctOptionId: editCorrectId,
        explanation: editExplanation.trim(),
        difficulty: editDifficulty,
        subjectId: editSubjectId,
        source: editSource.trim(),
        tags: parsedTags.length > 0 ? parsedTags : question.tags,
      };

      if (typeof markVerified === "boolean") {
        updates.adminVerified = markVerified;
      }

      await onInlineUpdate(question.id, updates, markVerified);
      setIsQuickEditing(false);
    } finally {
      setIsSavingInline(false);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all p-5 shadow-xs space-y-4 ${
        selected
          ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30"
          : question.adminVerified
          ? "border-emerald-200/80 dark:border-emerald-900/50 bg-white dark:bg-slate-900"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      }`}
    >
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(question.id)}
              aria-label={`Select question ${question.id}`}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          )}

          {question.adminVerified ? (
            <span className="px-2.5 py-0.5 rounded-md font-bold border bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              ভেরিফাইড (Verified)
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md font-semibold border bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              রিভিউ প্রয়োজন (Unverified)
            </span>
          )}

          {examName && (
            <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {examName}
            </span>
          )}
          {subjectName && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {subjectName}
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded-md font-medium border capitalize ${
              difficultyColors[question.difficulty]
            }`}
          >
            {question.difficulty}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md font-medium border capitalize ${
              statusColors[question.status]
            }`}
          >
            {question.status}
          </span>
          {question.year && (
            <span className="text-slate-400 dark:text-slate-500 font-mono">
              ({question.year})
            </span>
          )}
        </div>

        {/* Source */}
        {question.source && (
          <span className="text-slate-500 dark:text-slate-400 italic text-[11px]">
            {question.source}
          </span>
        )}
      </div>

      {/* Inline Quick Editor Drawer OR Standard Read View */}
      {isQuickEditing ? (
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2.5">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              দ্রুত এডিট ও ভেরিফাই (Inline Quick Edit & Verify)
            </span>
            <button
              type="button"
              onClick={() => setIsQuickEditing(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Question Prompt Input + Live Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              প্রশ্ন (Question Prompt — supports `$...$` LaTeX):
            </label>
            <textarea
              rows={2}
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="text-xs text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded border border-slate-200/70 dark:border-slate-800">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1.5">
                Preview:
              </span>
              <MathText text={editPrompt} />
            </div>
          </div>

          {/* Options & Correct Answer Radio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              অপশনসমূহ এবং সঠিক উত্তর নির্বাচন (Select radio for Correct Answer):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {editOptions.map((opt, idx) => {
                const isCorrect = editCorrectId === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`p-2 rounded-lg border flex items-center gap-2 ${
                      isCorrect
                        ? "bg-emerald-50/80 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-700"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct_${question.id}`}
                      checked={isCorrect}
                      onChange={() => setEditCorrectId(opt.id)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
                    />
                    <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold flex items-center justify-center uppercase shrink-0">
                      {opt.id}
                    </span>
                    <Input
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...editOptions];
                        updated[idx] = { ...updated[idx], text: e.target.value };
                        setEditOptions(updated);
                      }}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              ব্যাখ্যা / সমাধান (Explanation):
            </label>
            <textarea
              rows={2}
              value={editExplanation}
              onChange={(e) => setEditExplanation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject, Difficulty, Source, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Subject (বিষয়)
              </label>
              <select
                value={editSubjectId}
                onChange={(e) => setEditSubjectId(e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
              >
                {allSubjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Difficulty (মান)
              </label>
              <select
                value={editDifficulty}
                onChange={(e) => setEditDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
              >
                <option value="easy">Easy (সহজ)</option>
                <option value="medium">Medium (মাঝারি)</option>
                <option value="hard">Hard (কঠিন)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Source (উৎস)
              </label>
              <Input
                value={editSource}
                onChange={(e) => setEditSource(e.target.value)}
                className="h-8 text-xs"
                placeholder="e.g. 45th BCS"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Tags (কমা দিয়ে)
              </label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="h-8 text-xs"
                placeholder="45thbcs-bcs, math"
              />
            </div>
          </div>

          {/* Save & Verify Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsQuickEditing(false)}
              className="text-xs"
            >
              বাতিল (Cancel)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isSavingInline}
              onClick={() => handleSaveInline(undefined)}
              className="text-xs gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              শুধু সেভ করুন (Save Only)
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSavingInline}
              onClick={() => handleSaveInline(true)}
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              সেভ ও ভেরিফাই করুন (Save & Verify)
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Question Prompt with Math Support */}
          <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
            <MathText text={question.question} />
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            {question.options.map((opt) => {
              const isCorrect = opt.id === question.correctOptionId;
              return (
                <div
                  key={opt.id}
                  className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-colors ${
                    isCorrect
                      ? "bg-[#ECFDF5] border-[#10B981] text-[#047857] dark:bg-[#064E3B]/60 dark:border-[#34D399] dark:text-[#A7F3D0] font-medium"
                      : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 uppercase ${
                      isCorrect
                        ? "bg-[#10B981] text-white dark:bg-[#34D399] dark:text-[#0F172A]"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <MathText text={opt.text} />
                  </div>
                  {isCorrect && (
                    <Check className="h-4 w-4 shrink-0 text-[#10B981] dark:text-[#34D399]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation with Math Support */}
          {question.explanation && (
            <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              <span className="font-semibold text-indigo-700 dark:text-indigo-400 block mb-1">
                Explanation / সমাধান:
              </span>
              <MathText text={question.explanation} />
            </div>
          )}
        </>
      )}

      {/* Tags */}
      {question.tags.length > 0 && !isQuickEditing && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Tag className="h-3 w-3 text-slate-400 shrink-0" />
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono">ID: {question.id}</span>
          {allSubjects && allSubjects.length > 0 && onSubjectChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
                বিষয় পরিবর্তন:
              </span>
              <select
                value={question.subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={isChangingSubject}
                className="h-7 text-[11px] rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {allSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Verify / Unverify Toggle */}
          {onVerifyToggle && (
            <Button
              variant={question.adminVerified ? "outline" : "primary"}
              size="sm"
              onClick={handleToggleVerify}
              isLoading={isVerifying}
              className={`text-xs gap-1.5 font-semibold ${
                question.adminVerified
                  ? "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {question.adminVerified
                ? "আন-ভেরিফাই করুন (Unverify)"
                : "ভেরিফাই করুন (Verify)"}
            </Button>
          )}

          {/* Inline Quick Edit Button */}
          {onInlineUpdate && !isQuickEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={openQuickEdit}
              className="text-xs gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
            >
              <Sparkles className="h-3.5 w-3.5" />
              দ্রুত এডিট (Quick Edit)
            </Button>
          )}

          {/* Toggle Publish */}
          {onStatusChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              isLoading={isStatusChanging}
              className="text-xs gap-1.5"
            >
              {question.status === "published" ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Publish
                </>
              )}
            </Button>
          )}

          {/* Full Page Edit */}
          <Link href={`/admin/questions/${question.id}`}>
            <Button variant="secondary" size="sm" className="text-xs gap-1.5">
              <Edit className="h-3.5 w-3.5" />
              Full Edit
            </Button>
          </Link>

          {/* Delete */}
          {onDelete && (
            <>
              {showConfirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    className="text-xs"
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmDelete(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 p-2"
                  aria-label="Delete question"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
