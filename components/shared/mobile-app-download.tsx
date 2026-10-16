"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone,
  Download,
  Share2,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileAppDownloadProps {
  variant?: "card" | "banner" | "compact";
  className?: string;
}

export function MobileAppDownload({
  variant = "card",
  className = "",
}: MobileAppDownloadProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("https://medhavi-nine.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const downloadLandingUrl = `${origin}/download`;
  const directApkUrl = `${origin}/downloads/medhavi-app.apk`;
  const githubReleaseUrl =
    "https://github.com/bilash-biswas/medhavi-mobile/releases/tag/v1.0.0";

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(downloadLandingUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = downloadLandingUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "মেধাবী (Medhavi) - বিসিএস প্রস্তুতি মোবাইল অ্যাপ",
          text: "১০ম থেকে ৫০তম বিসিএস প্রশ্ন ব্যাংক, লাইভ কুইজ ও অনুশীলন সহ মেধাবী অ্যাপ ডাউনলোড করুন:",
          url: downloadLandingUrl,
        });
        return;
      } catch {
        // User cancelled or unsupported, fallback to copy link
      }
    }
    handleCopyLink();
  };

  if (variant === "banner") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-[#111827] dark:to-purple-950/30 p-6 md:p-8 shadow-sm ${className}`}
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex-1 space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>নতুন রিলিজ • অ্যান্ড্রয়েড APK v1.0.0</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              মেধাবী মোবাইল অ্যাপ দিয়ে যেকোনো সময় বিসিএস প্রস্তুতি নিন
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              ১০ম থেকে ৫০তম বিসিএসের ৫,৪০০+ প্রশ্ন ব্যাংক, নির্ভুল ব্যাখ্যা, লাইভ কুইজ, অফলাইন বুকমার্ক এবং ডার্ক মোড সহ সম্পূর্ণ বিনামূল্যে আপনার ফোনে ইন্সটল করুন।
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="text-xs px-2.5 py-1 bg-white/80 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                ✓ ১০ম-৫০তম বিসিএস
              </span>
              <span className="text-xs px-2.5 py-1 bg-white/80 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                ✓ অফলাইন বুকমার্ক
              </span>
              <span className="text-xs px-2.5 py-1 bg-white/80 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                ✓ ভুল ব্যাংক
              </span>
              <span className="text-xs px-2.5 py-1 bg-white/80 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                ✓ সাইজ: ৫৮ MB
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
              <a
                href={directApkUrl}
                download="medhavi-app.apk"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                APK সরাসরি ডাউনলোড করুন
              </a>
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>লিঙ্ক কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>অ্যাপ শেয়ার করুন</span>
                  </>
                )}
              </button>
              <Link
                href="/download"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                ডাউনলোড পেইজ <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm shrink-0">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
              <QRCodeSVG
                value={downloadLandingUrl}
                size={136}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <QrCode className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              অ্যান্ড্রয়েড স্মার্টফোনে ইনস্টল করার জন্য
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Card Variant for Login & Register pages
  return (
    <div
      className={`rounded-xl border border-indigo-100 dark:border-slate-800 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-900/80 dark:to-[#0F172A] p-4 sm:p-5 shadow-xs ${className}`}
    >
      <div className="flex items-start gap-4">
        {/* QR Code Box */}
        <div className="p-2 bg-white rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
          <QRCodeSVG
            value={downloadLandingUrl}
            size={96}
            level="M"
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Smartphone className="h-3.5 w-3.5" />
            <span>মোবাইল অ্যাপ • APK v1.0.0</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
            ফোনে ব্যবহার করতে স্ক্যান করুন
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            ১০ম-৫০তম বিসিএস প্রশ্ন ব্যাংক, লাইভ কুইজ ও অফলাইন অনুশীলন।
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <a
              href={directApkUrl}
              download="medhavi-app.apk"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              ডাউনলোড APK (৫৮ MB)
            </a>
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="শেয়ার লিঙ্ক কপি করুন"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3" />
                  <span>শেয়ার</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
