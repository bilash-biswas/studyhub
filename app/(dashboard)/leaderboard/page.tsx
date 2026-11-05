"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardEntry, LeaderboardPeriod } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/context/language-context";
import {
  getLeaderboard,
  updateLeaderboardDisplayName,
} from "@/lib/services/leaderboard-service";
import { LeaderboardSkeleton } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  Crown,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  BookOpen,
  Timer,
  Zap,
} from "lucide-react";

function toBnDigits(num: number | string): string {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bn[parseInt(d, 10)] ?? d);
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [period, setPeriod] = useState<LeaderboardPeriod>("daily");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadRankings() {
      setLoading(true);
      try {
        const list = await getLeaderboard(period, undefined, 30);
        setEntries(list);

        // Self-heal: If current user's entry in database is "Candidate", update to actual profile name
        if (user && profile?.name) {
          const myEntry = list.find((e) => e.userId === user.uid);
          if (myEntry && (myEntry.displayName === "Candidate" || !myEntry.displayName)) {
            updateLeaderboardDisplayName(user.uid, profile.name);
          }
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRankings();
  }, [period, user, profile?.name]);

  const getCandidateName = (entry: LeaderboardEntry): string => {
    if (user && entry.userId === user.uid && profile?.name) {
      return profile.name;
    }
    return entry.displayName || "Candidate";
  };

  const getInitials = (name: string): string => {
    if (!name) return "CA";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const topThree = entries.slice(0, 3);
  const userRankIndex = entries.findIndex((e) => e.userId === user?.uid);
  const userEntry = userRankIndex >= 0 ? entries[userRankIndex] : null;
  const isUserFirst = userRankIndex === 0;

  const challengeShareText = useMemo(() => {
    const pts = userEntry ? userEntry.score : 3;
    return `🏆 আমি মেধাবী ডেইলি ব্রেন টিজারে ${toBnDigits(pts)} পয়েন্ট পেয়ে আজকের জাতীয় মেধাতালিকায় শীর্ষে আছি!\n\nআপনি কি আমার স্কোর ভাঙতে পারবেন? আজই খেলুন:\n👉 https://medhavi-nine.vercel.app/daily`;
  }, [userEntry]);

  const handleCopyChallenge = async () => {
    try {
      await navigator.clipboard.writeText(challengeShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

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
              {t("জাতীয় মেধাতালিকা", "National Rankings")}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("মেধাতালিকা (Leaderboard)", "Leaderboard")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t(
              "অনুশীলন, মডেল টেস্ট এবং দৈনিক চ্যালেঞ্জের স্কোর অনুযায়ী রিয়েল-টাইম র‍্যাংকিং।",
              "Rankings updated live from practice sessions, mock exams, and daily challenges."
            )}
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod("daily")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              period === "daily"
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {t("দৈনিক", "Daily")}
          </button>
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              period === "weekly"
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {t("সাপ্তাহিক", "Weekly")}
          </button>
          <button
            type="button"
            onClick={() => setPeriod("allTime")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              period === "allTime"
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {t("সর্বকালীন", "All-Time")}
          </button>
        </div>
      </div>

      {loading ? (
        <LeaderboardSkeleton inlineOnly />
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t("এই সময়ের জন্য কোনো স্কোর এখনও জমা হয়নি", "No Scores Recorded for This Period Yet")}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t(
              "আজকের দৈনিক চ্যালেঞ্জ বা অনুশীলন সম্পন্ন করে মেধা তালিকার শীর্ষে নিজের নাম তুলুন!",
              "Be the very first candidate on the board! Complete a practice drill or take today's daily challenge."
            )}
          </p>
          <Button
            onClick={() => router.push("/daily")}
            size="sm"
            className="text-xs gap-1.5 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("আজকের ডেইলি চ্যালেঞ্জ খেলুন", "Play Daily Challenge")}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Podium (Responsive Layout: Centered when 1 or 2 candidates) */}
          {topThree.length === 1 ? (
            /* Single Champion Centered Layout */
            <div className="max-w-md mx-auto pt-2">
              <div className="bg-linear-to-b from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/30 dark:via-[#111827] dark:to-amber-950/20 rounded-2xl border-2 border-amber-400 dark:border-amber-600 p-6 shadow-md flex flex-col items-center text-center space-y-3 relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500">
                  <Crown className="h-7 w-7 drop-shadow-sm" />
                </div>
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-200 to-amber-400 dark:from-amber-900 dark:to-amber-700 flex items-center justify-center font-bold text-2xl text-amber-900 dark:text-amber-100 shadow-xs relative mt-1">
                  {getInitials(getCandidateName(topThree[0]))}
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    1
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                      {getCandidateName(topThree[0])}
                    </h3>
                    {user && topThree[0].userId === user.uid && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-600 text-white rounded-md">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                    {toBnDigits(topThree[0].questionsAttempted)}টি প্রশ্ন সমাধান
                  </p>
                </div>

                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  {toBnDigits(topThree[0].score)} <span className="text-sm font-semibold">pts</span>
                </div>
              </div>
            </div>
          ) : topThree.length === 2 ? (
            /* 2 Candidates Layout */
            <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* 1st Place */}
              <div className="bg-linear-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-[#111827] rounded-xl border-2 border-amber-400 dark:border-amber-600 p-6 shadow-md flex flex-col items-center text-center space-y-3 relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500">
                  <Crown className="h-6 w-6" />
                </div>
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center font-bold text-xl text-amber-800 dark:text-amber-200">
                  {getInitials(getCandidateName(topThree[0]))}
                </div>
                <span className="absolute top-14 right-1/2 translate-x-6 h-6 w-6 rounded-full bg-amber-400 text-slate-900 text-xs font-bold flex items-center justify-center shadow-xs">
                  1
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                    {getCandidateName(topThree[0])}
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    {toBnDigits(topThree[0].questionsAttempted)}টি প্রশ্ন সমাধান
                  </p>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {toBnDigits(topThree[0].score)} pts
                </div>
              </div>

              {/* 2nd Place */}
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col items-center text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 relative">
                  {getInitials(getCandidateName(topThree[1]))}
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center shadow-xs">
                    2
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                    {getCandidateName(topThree[1])}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {toBnDigits(topThree[1].questionsAttempted)}টি প্রশ্ন সমাধান
                  </p>
                </div>
                <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">
                  {toBnDigits(topThree[1].score)} pts
                </div>
              </div>
            </div>
          ) : (
            /* Standard 3-Podium Layout */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col items-center text-center space-y-3 sm:order-1">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300">
                      {getInitials(getCandidateName(topThree[1]))}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center shadow-xs">
                      2
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                      {getCandidateName(topThree[1])}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {toBnDigits(topThree[1].questionsAttempted)}টি সমাধান
                    </p>
                  </div>
                  <div className="text-lg font-extrabold text-slate-700 dark:text-slate-300">
                    {toBnDigits(topThree[1].score)} pts
                  </div>
                </div>
              )}

              {/* 1st Place (Gold / Crown) */}
              {topThree[0] && (
                <div className="bg-linear-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-[#111827] rounded-xl border-2 border-amber-400 dark:border-amber-600 p-6 shadow-md flex flex-col items-center text-center space-y-3 sm:order-2 sm:-translate-y-2 relative">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center font-bold text-xl text-amber-800 dark:text-amber-200">
                    {getInitials(getCandidateName(topThree[0]))}
                  </div>
                  <span className="absolute top-14 right-1/2 translate-x-6 h-6 w-6 rounded-full bg-amber-400 text-slate-900 text-xs font-bold flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                      {getCandidateName(topThree[0])}
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      {toBnDigits(topThree[0].questionsAttempted)}টি প্রশ্ন সমাধান
                    </p>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {toBnDigits(topThree[0].score)} pts
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col items-center text-center space-y-3 sm:order-3">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center font-bold text-lg text-amber-700 dark:text-amber-300">
                      {getInitials(getCandidateName(topThree[2]))}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      3
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                      {getCandidateName(topThree[2])}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {toBnDigits(topThree[2].questionsAttempted)}টি সমাধান
                    </p>
                  </div>
                  <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                    {toBnDigits(topThree[2].score)} pts
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Viral "Challenge Friends" Banner when candidate is #1 */}
          {isUserFirst && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Flame className="h-6 w-6 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    {t("🏆 আপনি আজকের মেধা তালিকায় শীর্ষে আছেন!", "You are currently leading today's leaderboard!")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {t(
                      "বিসিএস স্টাডি গ্রুপ ও বন্ধুদের সাথে শেয়ার করে চ্যালেঞ্জ জানান—দেখুন তারা আপনার স্কোর ভাঙতে পারে কিনা।",
                      "Challenge your BCS study groups and friends to beat your daily score!"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleCopyChallenge}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 flex-1 sm:flex-initial cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "কপি হয়েছে!" : "লিঙ্ক কপি"}
                </Button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(challengeShareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {t("হোয়াটসঅ্যাপে চ্যালেঞ্জ", "Challenge on WhatsApp")}
                </a>
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>{t("র‍্যাংক ও প্রার্থী", "Rank & Candidate")}</span>
              <span>{t("স্কোর", "Score")}</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrentUser = user?.uid === entry.userId;
                const displayName = getCandidateName(entry);

                return (
                  <div
                    key={entry.id || idx}
                    className={`px-5 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                      isCurrentUser
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40"
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
                            : "text-slate-500 bg-slate-100 dark:bg-slate-800/80"
                        }`}
                      >
                        {toBnDigits(rank)}
                      </span>

                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{displayName}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-600 text-white rounded-md">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {toBnDigits(entry.questionsAttempted)}টি প্রশ্ন সমাধান
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm text-[#4F46E5] dark:text-[#818CF8]">
                        {toBnDigits(entry.score)} <span className="text-xs font-medium">pts</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scoring Rules & Benchmark Guide (Enriches screen depth) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t("ডেইলি চ্যালেঞ্জ পয়েন্ট", "Daily Challenge Points")}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                প্রতিদিন ৫টি প্রশ্নের প্রতিটি সঠিক উত্তরের জন্য ১ পয়েন্ট। নিয়মিত খেলে স্ট্রিক বজায় থাকে এবং মেধা তালিকায় অগ্রাধিকার বাড়ে।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Timer className="h-4 w-4" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t("মডেল টেস্ট ও অনুশীলন", "Mocks & Practice")}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                ২০০ নম্বরের বিসিএস স্ট্যান্ডার্ড মডেল টেস্টে প্রতিটি সঠিক উত্তরে +১.০ এবং ভুল উত্তরে -০.৫০ নেগেটিভ মার্কিং হিসাব করা হয়।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-4 w-4" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t("৪৬তম বিসিএস টার্গেট কাট-অফ", "46th BCS Target Cutoff")}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                প্রিলিমিনারি নিরাপদ কাট-অফ লক্ষ্যমাত্রা সাধারণত ১১৫–১২৫ নম্বর। নিয়মিত দৈনিক প্র্যাকটিসে গড়ে ৮০%+ নির্ভুলতা বজায় রাখুন।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
