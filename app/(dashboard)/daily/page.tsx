"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question, DailyChallenge, AttemptAnswer } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import {
  getTodayDailyChallenge,
  hasUserCompletedDailyToday,
} from "@/lib/services/daily-challenge-service";
import { recordAttempt } from "@/lib/services/attempt-service";
import { QuestionRunner } from "@/components/practice/question-runner";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Trophy,
  CheckCircle2,
  Sparkles,
  Calendar,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function DailyChallengePage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [alreadyCompleted, setAlreadyCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadDaily() {
      if (!user) return;
      setLoading(true);
      try {
        const isDone = await hasUserCompletedDailyToday(user.uid);
        setAlreadyCompleted(isDone);

        const { challenge: c, questions: qs } = await getTodayDailyChallenge();
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
  }, [user]);

  const handleComplete = async (answers: AttemptAnswer[], durationSeconds: number) => {
    if (!user || !challenge) return;

    try {
      const attemptId = await recordAttempt({
        userId: user.uid,
        mockTestId: `daily_${challenge.date}`,
        mode: "daily",
        answers,
        durationSeconds,
        correctMark: 1,
        wrongMark: 0,
      });

      router.push(`/results/${attemptId}`);
    } catch (err) {
      console.error("Failed to save daily attempt:", err);
      alert("Error saving daily challenge results.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Preparing today&apos;s Daily Challenge...</p>
        </div>
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
        <Button
          onClick={() => router.push("/practice")}
          size="sm"
          className="text-xs"
        >
          Return to Practice
        </Button>
      </div>
    );
  }

  // Already completed screen
  if (alreadyCompleted) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-6 text-center">
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 mb-2">
              <Flame className="h-4 w-4 fill-current text-amber-500" />
              {profile?.currentStreak || 1} Day Streak Protected!
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Today&apos;s Challenge Completed!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You have already completed the 5-question challenge for today ({challenge?.date}). Come back tomorrow for a new set of questions!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Button
              onClick={() => router.push("/leaderboard")}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 w-full sm:w-auto"
            >
              <Trophy className="h-3.5 w-3.5" />
              View Leaderboard
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/practice")}
              className="text-xs gap-1.5 w-full sm:w-auto"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Keep Practicing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="w-full bg-linear-to-r from-amber-50 via-white to-amber-50 dark:from-amber-950/20 dark:via-[#111827] dark:to-amber-950/20 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Daily Brain Teaser (দৈনিক চ্যালেঞ্জ)
              </span>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                5 Questions
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Solve all 5 questions to protect your {profile?.currentStreak || 0}-day streak and climb the leaderboard.
            </p>
          </div>
        </div>
      </div>

      <QuestionRunner
        questions={questions}
        feedbackMode="instant"
        onComplete={handleComplete}
        examTitle="Daily Challenge"
        subjectTitle={challenge?.date}
        onExit={() => router.push("/dashboard")}
      />
    </div>
  );
}
