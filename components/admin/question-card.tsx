"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Edit, Trash2, Eye, EyeOff, Tag, BookOpen, AlertCircle } from "lucide-react";
import { Question } from "@/types";
import { MathText } from "@/components/ui/math-text";
import { Button } from "@/components/ui/button";

interface QuestionCardProps {
  question: Question;
  examName?: string;
  subjectName?: string;
  onStatusChange?: (id: string, status: "draft" | "published" | "archived") => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function QuestionCard({
  question,
  examName,
  subjectName,
  onStatusChange,
  onDelete,
}: QuestionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

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

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
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
              {isCorrect && <Check className="h-4 w-4 shrink-0 text-[#10B981] dark:text-[#34D399]" />}
            </div>
          );
        })}
      </div>

      {/* Explanation with Math Support */}
      {question.explanation && (
        <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-semibold text-indigo-700 dark:text-indigo-400 block mb-1">
            Explanation / সমাধান:
          </span>
          <MathText text={question.explanation} />
        </div>
      )}

      {/* Tags */}
      {question.tags.length > 0 && (
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
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">ID: {question.id}</span>

        <div className="flex items-center gap-2">
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

          {/* Edit */}
          <Link href={`/admin/questions/${question.id}`}>
            <Button variant="secondary" size="sm" className="text-xs gap-1.5">
              <Edit className="h-3.5 w-3.5" />
              Edit
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
