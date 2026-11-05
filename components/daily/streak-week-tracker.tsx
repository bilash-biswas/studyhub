"use client";

import React, { useMemo } from "react";
import { Flame, Check, Sparkles } from "lucide-react";

interface StreakWeekTrackerProps {
  effectiveStreak: number;
  hasCompletedToday: boolean;
  todayDate: string; // "YYYY-MM-DD"
}

function toBnDigits(num: number | string): string {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bn[parseInt(d, 10)] ?? d);
}

const WEEK_DAYS = [
  { key: "mon", labelBn: "সোম" },
  { key: "tue", labelBn: "মঙ্গল" },
  { key: "wed", labelBn: "বুধ" },
  { key: "thu", labelBn: "বৃহঃ" },
  { key: "fri", labelBn: "শুক্র" },
  { key: "sat", labelBn: "শনি" },
  { key: "sun", labelBn: "রবি" },
];

export function StreakWeekTracker({
  effectiveStreak,
  hasCompletedToday,
  todayDate,
}: StreakWeekTrackerProps) {
  const weekDaysStatus = useMemo(() => {
    // Current date in local time
    const [year, month, day] = todayDate.split("-").map(Number);
    const currDate = new Date(year, month - 1, day);

    // Get current day of week (0 is Sunday, 1 is Monday ... 6 is Saturday)
    const currentDayOfWeek = currDate.getDay();
    // Adjust to Monday-indexed (0 = Monday, ..., 6 = Sunday)
    const mondayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    return WEEK_DAYS.map((w, idx) => {
      const isPast = idx < mondayIndex;
      const isToday = idx === mondayIndex;
      const isFuture = idx > mondayIndex;

      let status: "active_today" | "streak_past" | "missed_past" | "future" = "future";

      if (isToday) {
        status = "active_today";
      } else if (isPast) {
        // If streak covers this day
        const daysAgo = mondayIndex - idx;
        if (effectiveStreak > daysAgo) {
          status = "streak_past";
        } else {
          status = "missed_past";
        }
      } else {
        status = "future";
      }

      return {
        ...w,
        status,
        isToday,
      };
    });
  }, [todayDate, effectiveStreak]);

  return (
    <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400">
            <Flame className="h-4 w-4 fill-current" />
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            সাপ্তাহিক স্ট্রিক ট্র্যাকার
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
          {toBnDigits(effectiveStreak)} দিনের স্ট্রিক 🔥
        </span>
      </div>

      {/* 7 Days Chain */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1 text-center">
        {weekDaysStatus.map((day) => {
          return (
            <div key={day.key} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-[10px] sm:text-[11px] font-semibold ${
                  day.isToday
                    ? "text-amber-600 dark:text-amber-400 font-bold"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {day.labelBn}
              </span>

              <div
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs transition-all ${
                  day.status === "active_today"
                    ? "bg-amber-500 text-white shadow-xs ring-4 ring-amber-500/20 scale-105"
                    : day.status === "streak_past"
                    ? "bg-emerald-500 text-white shadow-2xs"
                    : day.status === "missed_past"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    : "border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700"
                }`}
              >
                {day.status === "active_today" ? (
                  <Flame className="h-4 w-4 fill-current" />
                ) : day.status === "streak_past" ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : day.status === "missed_past" ? (
                  <span className="text-[10px]">•</span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational message */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1">
        {effectiveStreak >= 7
          ? "🎉 চমৎকার ধারাবাহিকতা! আপনি পুরো সপ্তাহ জুড়ে স্ট্রিক বজায় রেখেছেন।"
          : effectiveStreak >= 3
          ? "🔥 দারুণ অগ্রগতি! প্রতিদিন এভাবে অংশ নিয়ে স্ট্রিক অক্ষুণ্ণ রাখুন।"
          : "প্রতিদিন মাত্র ৫টি প্রশ্ন সমাধান করে আপনার স্ট্রিক ধরে রাখুন।"}
      </p>
    </div>
  );
}
