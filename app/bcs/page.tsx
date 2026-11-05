import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { BCS_BATCHES } from "@/lib/constants/bcs-batches";
import {
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Download,
  GraduationCap,
} from "lucide-react";

export const revalidate = 86400; // 24 hours ISR caching

const SITE_URL = "https://medhavi-nine.vercel.app";

export const metadata: Metadata = {
  title: "১০ম থেকে ৫০তম বিসিএস প্রিলিমিনারি প্রশ্ন ও সম্পূর্ণ সমাধান ব্যাংক | মেধাবী",
  description:
    "১০ম থেকে ৫০তম বিসিএস প্রিলিমিনারি পরীক্ষার সকল প্রশ্নপত্র, সঠিক উত্তর ও বিস্তারিত সমাধান। অনলাইনে অনুশীলন করুন, টাইমড মডেল টেস্ট দিন অথবা অফলাইন স্টাডি শীট প্রিন্ট করুন।",
  alternates: {
    canonical: `${SITE_URL}/bcs`,
  },
  keywords: [
    "১০ম থেকে ৫০তম বিসিএস প্রশ্ন ও সমাধান",
    "BCS Question Bank",
    "BCS Preliminary Question Solution",
    "৪৬তম বিসিএস প্রশ্ন সমাধান",
    "৪৫তম বিসিএস প্রশ্ন সমাধান",
    "বিসিএস প্রশ্ন ব্যাংক PDF",
    "মেধাবী",
  ],
  openGraph: {
    title: "১০ম–৫০তম বিসিএস প্রিলিমিনারি প্রশ্ন ও সমাধান ব্যাংক — মেধাবী",
    description:
      "১০ম থেকে ৫০তম বিসিএস প্রিলিমিনারি পরীক্ষার ৫,৪২০+ প্রশ্ন ও ব্যাখ্যা সহ সম্পূর্ণ সমাধান।",
    url: `${SITE_URL}/bcs`,
    siteName: "মেধাবী (Medhavi)",
    locale: "bn_BD",
    type: "website",
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "১০ম থেকে ৫০তম বিসিএস প্রিলিমিনারি প্রশ্ন ও সমাধান ব্যাংক",
  description:
    "১০ম থেকে ৫০তম বিসিএস প্রিলিমিনারি পরীক্ষার ৫,৪২০+ প্রশ্ন, সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা।",
  url: `${SITE_URL}/bcs`,
  provider: {
    "@type": "Organization",
    name: "মেধাবী (Medhavi)",
    url: SITE_URL,
  },
};

export default function BcsDirectoryPage() {
  const activeBatches = BCS_BATCHES.filter((b) => b.id !== "");

  return (
    <div className="space-y-8">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Hero Header */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>১০ম–৫০তম বিসিএস মাস্টার আর্কাইভ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          বিসিএস প্রিলিমিনারি প্রশ্ন ব্যাংক ও পূর্ণাঙ্গ সমাধান
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          ১০ম থেকে ৫০তম প্রতিটি বিসিএস প্রিলিমিনারি পরীক্ষার প্রশ্ন, নির্ভুল উত্তর ও বিস্তারিত সমাধান এক জায়গায়। সরাসরি যেকোনো ব্যাচ নির্বাচন করে অনলাইনে অনুশীলন করুন, টাইমড টেস্ট দিন অথবা স্টাডি শীট প্রিন্ট করুন।
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <BookOpen className="h-4 w-4" />
            <span>বিষয়ভিত্তিক প্রশ্ন ব্যাংকে যান</span>
          </Link>
          <Link
            href="/download"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="h-4 w-4" />
            <span>অ্যান্ড্রয়েড অ্যাপ (অফলাইন স্টাডি)</span>
          </Link>
        </div>
      </div>

      {/* Batch Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>সকল বিসিএস প্রিলিমিনারি প্রশ্নপত্র ({activeBatches.length}টি ব্যাচ)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {activeBatches.map((batch) => {
            const isSpecial = batch.labelBn.includes("বিশেষ");
            return (
              <Link
                key={batch.id}
                href={`/bcs/${batch.id}`}
                className="group block p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {batch.labelEn}
                  </span>
                  {isSpecial && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                      বিশেষ বিসিএস
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {batch.labelBn} প্রিলিমিনারি
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  সম্পূর্ণ প্রশ্নপত্র, সঠিক উত্তর ও সমাধান দেখুন।
                </p>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <span>প্রশ্ন ও সমাধান দেখুন</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
