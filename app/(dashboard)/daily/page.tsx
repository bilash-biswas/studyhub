"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Question, DailyChallenge, AttemptAnswer } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import {
  getTodayDailyChallenge,
  hasUserCompletedDailyToday,
} from "@/lib/services/daily-challenge-service";
import { recordAttempt } from "@/lib/services/attempt-service";
import { getEffectiveUserStreak, getFormattedDate } from "@/lib/calculations/streak";
import { DailyRunner } from "@/components/daily/daily-runner";
import { StreakWeekTracker } from "@/components/daily/streak-week-tracker";
import { DailyQuestionReview } from "@/components/daily/daily-question-review";
import { QuestionCardSkeleton } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Trophy,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Clock,
  LogIn,
  UserPlus,
  BookOpen,
} from "lucide-react";

function toBnDigits(num: number | string): string {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bn[parseInt(d, 10)] ?? d);
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

interface GuestResult {
  score: number;
  total: number;
  durationSeconds: number;
  date: string;
}

export default function DailyChallengePage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const effectiveStreak = getEffectiveUserStreak(profile);
  const today = getFormattedDate();

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [alreadyCompleted, setAlreadyCompleted] = useState<boolean>(false);
  const [guestResult, setGuestResult] = useState<GuestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  // Countdown timer to midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if canvas is unavailable
    }
  }, []);

  // Load Daily Challenge (Runs for both logged-in users and guests)
  useEffect(() => {
    async function loadDaily() {
      setLoading(true);
      setErrorMsg(null);

      try {
        if (user) {
          const isDone = await hasUserCompletedDailyToday(user.uid, today);
          setAlreadyCompleted(isDone);
        } else {
          // Check local storage for guest attempt today
          const cached = localStorage.getItem(`medhavi_daily_guest_${today}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setGuestResult(parsed);
              setAlreadyCompleted(true);
            } catch {
              // Ignore corrupt local storage
            }
          }
        }

        const { challenge: c, questions: qs } = await getTodayDailyChallenge(today);
        setChallenge(c);
        setQuestions(qs);
      } catch (err: any) {
        console.error("Failed to load daily challenge:", err);
        setErrorMsg(err?.message || "Error loading daily challenge.");
      } finally {
        setLoading(false);
      }
    }

    loadDaily();
  }, [user, today]);

  const handleComplete = async (answers: AttemptAnswer[], durationSeconds: number) => {
    if (!challenge) return;

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalCount = answers.length;

    // Trigger celebratory confetti
    triggerCelebration();

    // Logged in user: record to Firestore and navigate to results or completed view
    if (user) {
      try {
        const attemptId = await recordAttempt({
          userId: user.uid,
          displayName: profile?.name || user.displayName || "Candidate",
          photoURL: profile?.photoURL || user.photoURL || null,
          mockTestId: `daily_${challenge.date}`,
          mode: "daily",
          answers,
          durationSeconds,
          correctMark: 1,
          wrongMark: 0,
        });

        await refreshProfile();
        router.push(`/results/${attemptId}`);
      } catch (err) {
        console.error("Failed to save daily attempt:", err);
        alert("Error saving daily challenge results.");
      }
    } else {
      // Guest mode: Save result locally and display high-conversion result modal
      const res: GuestResult = {
        score: correctCount,
        total: totalCount,
        durationSeconds,
        date: challenge.date,
      };
      setGuestResult(res);
      setAlreadyCompleted(true);
      try {
        localStorage.setItem(`medhavi_daily_guest_${today}`, JSON.stringify(res));
      } catch {
        // Ignore storage errors
      }
    }
  };

  // Generate Wordle-style share text
  const shareText = useMemo(() => {
    const scoreVal = guestResult ? guestResult.score : 5;
    const totalVal = guestResult ? guestResult.total : 5;
    const durationVal = guestResult ? guestResult.durationSeconds : undefined;
    const streakCount = user ? effectiveStreak : 1;

    const mins = durationVal ? Math.floor(durationVal / 60) : 0;
    const secs = durationVal ? durationVal % 60 : 0;
    const timeStr = durationVal
      ? mins > 0
        ? `${toBnDigits(mins)} মিনিট ${toBnDigits(secs)} সেকেন্ড`
        : `${toBnDigits(secs)} সেকেন্ড`
      : "";

    const pct = totalVal > 0 ? Math.round((scoreVal / totalVal) * 100) : 100;

    return `🧠 মেধাবী ডেইলি ব্রেন টিজার (${today})
🎯 স্কোর: ${toBnDigits(scoreVal)}/${toBnDigits(totalVal)} (${toBnDigits(pct)}% নির্ভুলতা)${timeStr ? `\n⚡ সময়: ${timeStr}` : ""}${
      streakCount > 0 ? `\n🔥 ${toBnDigits(streakCount)} দিনের স্ট্রিক সুরক্ষিত!` : ""
    }

আপনি কি আমার স্কোর ভাঙতে পারবেন? আজই খেলুন:
👉 https://medhavi-nine.vercel.app/daily`;
  }, [guestResult, user, effectiveStreak, today]);

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4" role="status" aria-label="Loading daily challenge">
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-40 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 shimmer-wave" />
            <div className="h-3.5 w-60 rounded-md bg-slate-200/80 dark:bg-slate-800/80 shimmer-wave" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 shimmer-wave" />
        </div>
        <QuestionCardSkeleton count={1} />
      </div>
    );
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">Daily Challenge Unavailable</h2>
        <p className="text-xs text-slate-500">{errorMsg || "Check back soon."}</p>
        <Button onClick={() => router.push("/practice")} size="sm" className="text-xs">
          Return to Practice
        </Button>
      </div>
    );
  }

  // Already completed screen (Supports both Authenticated and Guest)
  if (alreadyCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6">
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 mb-2">
              <Flame className="h-4 w-4 fill-current text-amber-500" />
              {user ? `${toBnDigits(effectiveStreak)} দিনের স্ট্রিক সুরক্ষিত!` : "আজকের চ্যালেঞ্জ সম্পন্ন!"}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {guestResult
                ? `আপনি ৫টিতে ${toBnDigits(guestResult.score)}টি সঠিক উত্তর দিয়েছেন!`
                : "আজকের ডেইলি চ্যালেঞ্জ সম্পন্ন!"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {user
                ? `আপনি আজকের ৫টি গুরুত্বপূর্ণ বিসিএস বিষয়ের চ্যালেঞ্জ সফলভাবে সম্পন্ন করেছেন (${challenge?.date})। আগামীকাল রাত ১২টায় নতুন সেটের জন্য প্রস্তুত থাকুন!`
                : "আপনার স্কোর সাময়িকভাবে ব্রাউজারে সংরক্ষিত আছে। আপনার ১ দিনের স্ট্রিক সেভ করতে এখনই অ্যাকাউন্ট খুলুন!"}
            </p>
          </div>

          {/* 7-Day Streak Week Visualizer */}
          {user && (
            <StreakWeekTracker
              effectiveStreak={effectiveStreak}
              hasCompletedToday={true}
              todayDate={today}
            />
          )}

          {/* Guest Sign-up / Login Viral Prompt */}
          {!user && (
            <div className="p-4 rounded-xl bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-800/80 text-left space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  আপনার আজকের স্ট্রিক সেভ করুন
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                ফ্রি অ্যাকাউন্ট তৈরি করে আপনার আজকের স্কোর লিডারবোর্ডে যুক্ত করুন এবং প্রতিদিনের স্ট্রিক রেকর্ড ধরে রাখুন।
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/register?redirect=/daily"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  স্ট্রিক সেভ করুন (রেজিস্টার)
                </Link>
                <Link
                  href="/login?redirect=/daily"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <LogIn className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Wordle-style Emoji Share Block */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-200/80 dark:border-amber-900/60 text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  বন্ধুদের সাথে স্কোর শেয়ার করুন (Wordle Style)
                </span>
              </div>
            </div>
            <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300 shadow-2xs">
              {shareText}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyShare}
                variant="outline"
                size="sm"
                className="text-xs flex-1 gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "কপি হয়েছে!" : "কপি করুন"}
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex-1 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                হোয়াটসঅ্যাপে শেয়ার
              </a>
            </div>
          </div>

          {/* Midnight Countdown Clock */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>পরবর্তী চ্যালেঞ্জ আনলক হতে বাকি</span>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-slate-800 dark:text-slate-200">
              <span>{toBnDigits(String(countdown.hours).padStart(2, "0"))}</span>
              <span className="text-slate-400 mx-1">:</span>
              <span>{toBnDigits(String(countdown.minutes).padStart(2, "0"))}</span>
              <span className="text-slate-400 mx-1">:</span>
              <span className="text-amber-600 dark:text-amber-400">
                {toBnDigits(String(countdown.seconds).padStart(2, "0"))}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Button
              onClick={() => router.push("/leaderboard")}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 w-full sm:w-auto cursor-pointer"
            >
              <Trophy className="h-3.5 w-3.5" />
              মেধাতালিকা দেখুন
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/question-bank")}
              className="text-xs gap-1.5 w-full sm:w-auto cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              প্রশ্ন ব্যাংক ব্রাউজ করুন
            </Button>
          </div>
        </div>

        {/* Expandable Review of Today's 5 Questions & Explanations */}
        {questions.length > 0 && <DailyQuestionReview questions={questions} />}
      </div>
    );
  }

  // Active Challenge Runner View
  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-12">
      <DailyRunner
        questions={questions}
        onComplete={handleComplete}
        dateTitle={challenge?.date}
        onExit={() => router.push(user ? "/dashboard" : "/question-bank")}
      />
    </div>
  );
}
