"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  Smartphone,
  Share2,
  Check,
  ArrowLeft,
  ShieldCheck,
  Zap,
  BookOpen,
  Trophy,
  History,
  FileCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function DownloadPage() {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("https://medhavi-nine.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const apkUrl = `${origin}/downloads/medhavi-app.apk`;
  const githubReleaseUrl =
    "https://github.com/bilash-biswas/medhavi-mobile/releases/tag/v1.0.0";

  const handleShare = async () => {
    const url = `${origin}/download`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "মেধাবী (Medhavi) - বিসিএস প্রস্তুতি মোবাইল অ্যাপ",
          text: "১০ম থেকে ৫০তম বিসিএস প্রশ্ন ব্যাংক, লাইভ কুইজ ও অনুশীলন সহ মেধাবী অ্যাপ ডাউনলোড করুন:",
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>হোমে ফিরুন</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>শেয়ার করুন</span>
                </>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Smartphone className="h-3.5 w-3.5" />
            <span>অ্যান্ড্রয়েড মোবাইল অ্যাপ • ভার্সন ১.০.০</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            মেধাবী (Medhavi) মোবাইল অ্যাপ
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            যেকোনো সময়, যেকোনো জায়গায় বিসিএস ও চাকরির সেরা প্রস্তুতির জন্য অফিসিয়াল মোবাইল অ্যাপ ডাউনলোড করুন।
          </p>

          {/* Download & QR Action Card */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* QR Code */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 text-center">
                  <QRCodeSVG
                    value={apkUrl}
                    size={140}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                  <span className="block text-[11px] font-medium text-slate-500 mt-2">
                    ক্যামেরা দিয়ে স্ক্যান করুন
                  </span>
                </div>

                {/* Direct Action */}
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    সরাসরি APK ইনস্টল করুন
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    সাইজ: ৫৮ MB • অ্যান্ড্রয়েড ৭.০ বা তার পরবর্তী সংস্করণ
                  </p>

                  <div className="space-y-2 pt-2">
                    <a
                      href={apkUrl}
                      download="medhavi-app.apk"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4" />
                      APK ডাউনলোড করুন (৫৮ MB)
                    </a>

                    <a
                      href={githubReleaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline"
                    >
                      GitHub Release থেকে ডাউনলোড করুন →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm">১০ম-৫০তম বিসিএস</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ৫,৪০০+ প্রিলিমিনারি প্রশ্ন ও নির্ভুল বিশদ ব্যাখ্যা।
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm">লাইভ কুইজ ব্যাটল</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              সবার সাথে রিয়েল-টাইম কুইজ ও লিডারবোর্ড র‍্যাংকিং।
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="h-10 w-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <History className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm">স্মার্ট ভুল ব্যাংক</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ভুল হওয়া প্রশ্নগুলো আলাদা করে রিভিশন দেওয়ার সুবিধা।
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm">অফলাইন বুকমার্ক</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              গুরুত্বপূর্ণ প্রশ্ন ইন্টারনেট ছাড়াই পড়ার সুবিধা।
            </p>
          </div>
        </div>

        {/* 3 Step Installation Guide */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>মোবাইলে ইনস্টল করার ৩টি সহজ ধাপ</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              গুগল প্লে স্টোরের বাইরে সরাসরি APK ইনস্টল করতে নিচের নিয়ম অনুসরণ করুন:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="inline-flex h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-bold items-center justify-center">
                ১
              </span>
              <h5 className="font-semibold text-sm">APK ডাউনলোড করুন</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                উপরের বাটনে ক্লিক করে <strong>medhavi-app.apk</strong> ফাইলটি ডাউনলোড করুন।
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="inline-flex h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-bold items-center justify-center">
                ২
              </span>
              <h5 className="font-semibold text-sm">&quot;Download anyway&quot; চাপুন</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ব্রাউজারে &quot;File might be harmful&quot; আসলে <strong>Download anyway</strong> বা <strong>অনুমতি দিন</strong> সিলেক্ট করুন।
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="inline-flex h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-bold items-center justify-center">
                ৩
              </span>
              <h5 className="font-semibold text-sm">ইনস্টল ও ওপেন করুন</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ডাউনলোড শেষে ফাইলে ক্লিক করে <strong>Install</strong> চাপুন এবং মেধাবী অ্যাপে বিসিএস প্রস্তুতি শুরু করুন!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
