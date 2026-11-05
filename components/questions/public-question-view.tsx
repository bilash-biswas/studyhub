"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Question, Subject } from "@/types";
import { MathText } from "@/components/ui/math-text";
import {
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lightbulb,
  Share2,
  Check,
  Download,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  ArrowRight,
} from "lucide-react";

interface PublicQuestionViewProps {
  question: Question;
  subject?: Subject | null;
  relatedQuestions: Question[];
}

export function PublicQuestionView({
  question,
  subject,
  relatedQuestions,
}: PublicQuestionViewProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOptionClick = (optionId: string) => {
    setSelectedOptionId(optionId);
    setShowExplanation(true);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: question.question,
          text: `মেধাবীতে বিসিএস প্রশ্ন ও সমাধান দেখুন: ${question.question.slice(0, 100)}...`,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const optionLabels = ["ক", "খ", "গ", "ঘ", "ঙ", "চ"];
  const sourceLabel =
    question.source ||
    (question.tags?.find((t) => t.toLowerCase().includes("bcs"))?.toUpperCase() ?? "");

  const subjectName = subject?.name;

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto pb-1">
        <Link
          href="/"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
        >
          হোম
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <Link
          href="/question-bank"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
        >
          প্রশ্ন ব্যাংক
        </Link>
        {subjectName && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <Link
              href={`/question-bank?subjectId=${question.subjectId}`}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
            >
              {subjectName}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-200 font-medium truncate max-w-[200px] sm:max-w-md">
          {question.id}
        </span>
      </nav>

      {/* 2. Main Question Card */}
      <article className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Exam / Source */}
            {sourceLabel && (
              <span className="font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                {sourceLabel}
              </span>
            )}

            {/* Subject */}
            {subjectName && (
              <span className="font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {subjectName}
              </span>
            )}

            {/* Difficulty */}
            {question.difficulty && (
              <span
                className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                  question.difficulty === "easy"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : question.difficulty === "hard"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                }`}
              >
                {question.difficulty === "easy"
                  ? "সহজ"
                  : question.difficulty === "medium"
                  ? "মধ্যম"
                  : "কঠিন"}
              </span>
            )}

            {/* Year */}
            {question.year && (
              <span className="text-slate-400 dark:text-slate-500 font-medium">
                ({question.year})
              </span>
            )}

            {/* Admin Verified */}
            {question.adminVerified && (
              <span
                title="বিসিএস বিশেষজ্ঞ প্যানেল দ্বারা পরীক্ষিত ও নির্ভুল"
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md text-[11px]"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ভেরিফাইড</span>
              </span>
            )}
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>শেয়ার</span>
              </>
            )}
          </button>
        </div>

        {/* Question Prompt */}
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed mb-6">
          <MathText text={question.question} />
        </h1>

        {/* Optional Diagram / Image */}
        {question.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-md">
            <img
              src={question.imageUrl}
              alt="Question illustration"
              className="w-full h-auto object-contain max-h-72"
              loading="lazy"
            />
          </div>
        )}

        {/* Multiple Choice Options */}
        <div className="space-y-2.5 mb-6" role="radiogroup" aria-label="Answer options">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === question.correctOptionId;
            const showOutcome = showExplanation || selectedOptionId !== null;

            let cardStyles =
              "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 bg-white dark:bg-[#111827]";
            let badgeStyles =
              "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

            if (showOutcome) {
              if (isCorrect) {
                cardStyles =
                  "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-2xs";
                badgeStyles =
                  "bg-emerald-500 text-white border-emerald-500 font-bold";
              } else if (isSelected && !isCorrect) {
                cardStyles =
                  "border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100";
                badgeStyles =
                  "bg-rose-500 text-white border-rose-500 font-bold";
              }
            }

            return (
              <button
                key={opt.id || idx}
                type="button"
                onClick={() => handleOptionClick(opt.id)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${cardStyles}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 border transition-colors ${badgeStyles}`}
                  >
                    {optionLabels[idx] || String.fromCharCode(65 + idx)}
                  </span>
                  <div className="text-slate-800 dark:text-slate-200 leading-snug font-medium">
                    <MathText text={opt.text} />
                  </div>
                </div>

                {showOutcome && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {showOutcome && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Toggle for Explanation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowExplanation((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 transition-colors cursor-pointer"
          >
            {showExplanation ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>ব্যাখ্যা লুকান</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>সঠিক উত্তর ও ব্যাখ্যা দেখুন</span>
              </>
            )}
          </button>

          <Link
            href="/question-bank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>প্রশ্ন ব্যাংকে আরও অনুশীলন করুন</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Detailed Explanation Drawer */}
        {showExplanation && (
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Lightbulb className="h-4 w-4 shrink-0" />
                <span>সঠিক উত্তর ও বিস্তারিত সমাধান</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                {question.explanation ? (
                  <MathText text={question.explanation} />
                ) : (
                  <p className="text-slate-500 italic">
                    এই প্রশ্নের সঠিক উত্তর অপশন (
                    {
                      optionLabels[
                        question.options.findIndex((o) => o.id === question.correctOptionId)
                      ] || question.correctOptionId
                    }
                    )। বিস্তারিত সমাধান শীঘ্রই যুক্ত করা হবে।
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">ট্যাগ:</span>
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* 3. High-Conversion App Download & Web Practice CTA Card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-indigo-400/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>১০ম–৫০তম বিসিএস প্রশ্ন ব্যাংক</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              সম্পূর্ণ প্রস্তুতি নিন মেধাবী মোবাইল অ্যাপে
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              ৫,৪২০+ ভেরিফাইড বিসিএস ও চাকরির প্রশ্ন ব্যাংক, অফলাইন স্টাডি মোড, বিষয়ভিত্তিক অনুশীলন এবং লাইভ মডেল টেস্ট দিন সরাসরি আপনার মোবাইলে।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/download"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-indigo-900 hover:bg-indigo-50 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>অ্যাপ ডাউনলোড (APK v1.0.5)</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-500/30 transition-all cursor-pointer"
            >
              <GraduationCap className="h-4 w-4" />
              <span>ফ্রি অ্যাকাউন্ট খুলুন</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Related Questions Hub (SEO Internal Crawl Matrix) */}
      {relatedQuestions && relatedQuestions.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>সম্পর্কিত বিসিএস প্রশ্নাবলি</span>
            </h2>
            <Link
              href="/question-bank"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              সব দেখুন
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relatedQuestions.map((relQ, idx) => (
              <Link
                key={relQ.id}
                href={`/questions/${relQ.id}`}
                className="group block p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {relQ.source || `প্রশ্ন ${idx + 1}`}
                  </span>
                  {relQ.difficulty && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{relQ.difficulty}</span>
                    </>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <MathText text={relQ.question} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
