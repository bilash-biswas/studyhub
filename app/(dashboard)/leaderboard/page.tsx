"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardEntry, LeaderboardPeriod } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { getLeaderboard } from "@/lib/services/leaderboard-service";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  Flame,
  Target,
  Crown,
  User,
  ArrowRight,
} from "lucide-react";

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRankings() {
      setLoading(true);
      try {
        const list = await getLeaderboard(period, undefined, 30);
        setEntries(list);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRankings();
  }, [period]);

  const topThree = entries.slice(0, 3);
  const remainingEntries = entries.slice(3);

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Trophy className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              National Rankings
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Leaderboard (মেধাতালিকা)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Rankings updated live from practice sessions, mock exams, and daily challenges.
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod("daily")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              period === "daily"
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              period === "weekly"
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setPeriod("allTime")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              period === "allTime"
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[350px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Fetching candidate scores...</p>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No Scores Recorded for This Period Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the very first candidate on the board! Complete a practice drill or take today&apos;s daily challenge.
          </p>
          <Button
            onClick={() => router.push("/daily")}
            size="sm"
            className="text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Play Daily Challenge
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col items-center text-center space-y-3 sm:order-1">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300">
                      {topThree[1].displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center shadow-xs">
                      2
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                      {topThree[1].displayName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {topThree[1].questionsAttempted} solved
                    </p>
                  </div>

                  <div className="text-lg font-extrabold text-slate-700 dark:text-slate-300">
                    {topThree[1].score} pts
                  </div>
                </div>
              )}

              {/* 1st Place (Gold / Crown) */}
              {topThree[0] && (
                <div className="bg-linear-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-[#111827] rounded-xl border-2 border-amber-400 dark:border-amber-600 p-6 shadow-md flex flex-col items-center text-center space-y-3 sm:order-2 sm:-translate-y-2">
                  <div className="relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500">
                      <Crown className="h-6 w-6" />
                    </div>
                    <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center font-bold text-xl text-amber-800 dark:text-amber-200">
                      {topThree[0].displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-400 text-slate-900 text-xs font-bold flex items-center justify-center shadow-xs">
                      1
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                      {topThree[0].displayName}
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      {topThree[0].questionsAttempted} questions solved
                    </p>
                  </div>

                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {topThree[0].score} pts
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col items-center text-center space-y-3 sm:order-3">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center font-bold text-lg text-amber-700 dark:text-amber-300">
                      {topThree[2].displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      3
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                      {topThree[2].displayName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {topThree[2].questionsAttempted} solved
                    </p>
                  </div>

                  <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                    {topThree[2].score} pts
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Rank & Candidate</span>
              <span>Score</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrentUser = user?.uid === entry.userId;

                return (
                  <div
                    key={entry.id || idx}
                    className={`px-5 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                      isCurrentUser
                        ? "bg-indigo-50/60 dark:bg-indigo-950/40"
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          rank === 1
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                            : rank === 2
                            ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            : rank === 3
                            ? "bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-400"
                            : "text-slate-500"
                        }`}
                      >
                        {rank}
                      </span>

                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{entry.displayName}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-600 text-white rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {entry.questionsAttempted} questions attempted
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm text-[#4F46E5] dark:text-[#818CF8]">
                        {entry.score} pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
