"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Send,
  Flame,
  Pin,
  PinOff,
  Trash2,
  RefreshCw,
  Sparkles,
  Users,
  CheckCircle2,
  ExternalLink,
  Trophy,
  Zap,
  AlertCircle,
} from "lucide-react";
import {
  AppNotification,
  NotificationCategory,
  StreakTargetSegment,
  UserProfile,
} from "@/types";
import {
  STREAK_SEGMENTS,
  sendPushNotification,
  getNotifications,
  toggleNotificationPin,
  resendNotification,
  deleteNotification,
  formatStreakTargetBadge,
} from "@/lib/services/notification-service";
import { getUsers } from "@/lib/services/user-service";
import { getEffectiveUserStreak } from "@/lib/calculations/streak";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuickTemplate {
  label: string;
  title: string;
  body: string;
  category: NotificationCategory;
  targetStreakSegment: StreakTargetSegment;
  actionUrl: string;
  isPinned: boolean;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    label: "🔥 ০ দিন স্ট্রিক (Comeback Alert)",
    title: "🔥 আপনার স্ট্রিক ০ হয়ে গেছে! আজই অনুশীলনে ফিরুন",
    body: "মাত্র ৫টি প্রশ্নের উত্তর দিয়ে আজই নতুন স্ট্রিক শুরু করুন এবং বিসিএস প্রস্তুতিতে এগিয়ে থাকুন।",
    category: "streak_alert",
    targetStreakSegment: "streak_zero",
    actionUrl: "/practice",
    isPinned: false,
  },
  {
    label: "🌱 ১–৩ দিন স্ট্রিক (Keep Going)",
    title: "🌱 দারুণ শুরু! আপনার স্ট্রিক ধরে রাখুন",
    body: "আপনি ধারাবাহিক অনুশীলনের পথে আছেন। আজকের প্র্যাকটিস সেশন সম্পন্ন করে স্ট্রিক বাড়িয়ে নিন!",
    category: "streak_alert",
    targetStreakSegment: "streak_beginner",
    actionUrl: "/practice",
    isPinned: false,
  },
  {
    label: "⚡ ৪–৬ দিন স্ট্রিক (7-Day Milestone Push)",
    title: "⚡ আর মাত্র কয়েক দিন! ৭ দিনের স্ট্রিক মাইলফলক ছুঁয়ে ফেলুন",
    body: "আপনি সাপ্তাহিক স্ট্রিক চ্যাম্পিয়ন হওয়ার খুব কাছাকাছি! আজকের অনুশীলন মিস করবেন না।",
    category: "streak_alert",
    targetStreakSegment: "streak_rising",
    actionUrl: "/practice",
    isPinned: false,
  },
  {
    label: "🏆 ৭+ দিন স্ট্রিক চ্যাম্পিয়ন (Champion Challenge)",
    title: "🏆 অভিনন্দন স্ট্রিক চ্যাম্পিয়ন! বিশেষ কঠিন চ্যালেঞ্জ প্রস্তুত",
    body: "টানা ৭+ দিন অনুশীলনের জন্য অভিনন্দন! আপনার দক্ষতা যাচাই করতে আজকের চ্যালেঞ্জিং মক টেস্টে অংশ নিন।",
    category: "streak_alert",
    targetStreakSegment: "streak_champion",
    actionUrl: "/exams",
    isPinned: false,
  },
  {
    label: "📝 ৪৬তম বিসিএস মক টেস্ট (All Users)",
    title: "📝 ৪৬তম বিসিএস পূর্ণাঙ্গ মডেল টেস্ট এখন লাইভ!",
    body: "২০০ প্রশ্নের পূর্ণাঙ্গ বিসিএস প্রিলিমিনারি মক টেস্টে অংশ নিন এবং লিডারবোর্ডে নিজের অবস্থান যাচাই করুন।",
    category: "exam_alert",
    targetStreakSegment: "all",
    actionUrl: "/exams",
    isPinned: true,
  },
  {
    label: "📚 নতুন ভেরিফাইড প্রশ্ন (All Users)",
    title: "📚 প্রশ্নব্যাংকে নতুন অ্যাডমিন ভেরিফাইড প্রশ্ন যুক্ত হয়েছে!",
    body: "ব্যাখ্যাসহ ১০ম–৫০তম বিসিএসের ভেরিফাইড প্রশ্ন ও সমাধান এখন প্রশ্নব্যাংকে অনুশীলন করুন।",
    category: "new_questions",
    targetStreakSegment: "all",
    actionUrl: "/question-bank",
    isPinned: false,
  },
];

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Composer State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<NotificationCategory>("streak_alert");
  const [targetExamId, setTargetExamId] = useState("all");
  const [targetStreakSegment, setTargetStreakSegment] =
    useState<StreakTargetSegment>("all");
  const [minStreak, setMinStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(10);
  const [actionUrl, setActionUrl] = useState("/practice");
  const [isPinned, setIsPinned] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [notifList, userList] = await Promise.all([
        getNotifications(40),
        getUsers(500),
      ]);
      setNotifications(notifList);
      setUsers(userList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate live streak cohort counts from users
  const cohortCounts = React.useMemo(() => {
    const counts: Record<StreakTargetSegment, number> = {
      all: users.length,
      streak_zero: 0,
      streak_beginner: 0,
      streak_rising: 0,
      streak_champion: 0,
      streak_legend: 0,
      custom: 0,
    };

    for (const u of users) {
      const s = getEffectiveUserStreak(u);
      if (s === 0) counts.streak_zero++;
      if (s >= 1 && s <= 3) counts.streak_beginner++;
      if (s >= 4 && s <= 6) counts.streak_rising++;
      if (s >= 7) counts.streak_champion++;
      if (s >= 30) counts.streak_legend++;
      if (s >= minStreak && s <= maxStreak) counts.custom++;
    }

    return counts;
  }, [users, minStreak, maxStreak]);

  const applyTemplate = (tpl: QuickTemplate) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setCategory(tpl.category);
    setTargetStreakSegment(tpl.targetStreakSegment);
    setActionUrl(tpl.actionUrl);
    setIsPinned(tpl.isPinned);
    setFeedback(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSending(true);
    setFeedback(null);
    try {
      await sendPushNotification({
        title,
        body,
        category,
        targetExamId,
        targetStreakSegment,
        minStreak: targetStreakSegment === "custom" ? minStreak : null,
        maxStreak: targetStreakSegment === "custom" ? maxStreak : null,
        actionUrl,
        isPinned,
        priority: "high",
        createdBy: user?.uid || "admin",
      });

      setTitle("");
      setBody("");
      setIsPinned(false);
      await loadData();
      setFeedback(
        "পুশ নোটিফিকেশন সফলভাবে পাঠানো হয়েছে! মোবাইল অ্যাপ এবং ওয়েব অ্যাপে তাৎক্ষণিক পৌঁছে গেছে।"
      );
    } catch (err: any) {
      setFeedback(`Error sending notification: ${err?.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleTogglePin = async (notif: AppNotification) => {
    const nextPin = !notif.isPinned;
    await toggleNotificationPin(notif.id, nextPin);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isPinned: nextPin } : n))
    );
  };

  const handleResend = async (notif: AppNotification) => {
    await resendNotification(notif.id);
    await loadData();
    setFeedback(`"${notif.title}" নোটিফিকেশনটি পুনরায় পুশ করা হয়েছে!`);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const categoryLabels: Record<NotificationCategory, { label: string; color: string }> = {
    streak_alert: {
      label: "🔥 স্ট্রিক অ্যালার্ট (Streak)",
      color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
    },
    exam_alert: {
      label: "📝 পরীক্ষার নোটিশ (Exam)",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
    },
    daily_challenge: {
      label: "⚡ ডেইলি চ্যালেঞ্জ (Daily)",
      color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    },
    new_questions: {
      label: "📚 নতুন প্রশ্ন (Questions)",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    },
    live_quiz: {
      label: "🎮 লাইভ কুইজ (Live Quiz)",
      color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    },
    announcement: {
      label: "📢 সাধারণ ঘোষণা (General)",
      color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Push Notification & Streak Targeting Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            মোবাইল অ্যাপ (Android APK) ও ওয়েব অ্যাপে তাৎক্ষণিক পুশ নোটিফিকেশন এবং স্ট্রিক অনুযায়ী (Streak-wise) টার্গেটেড অ্যালার্ট পাঠান।
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Cohorts
        </Button>
      </div>

      {/* Live Streak Cohort Audience Selector Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            স্ট্রিক অনুযায়ী শিক্ষার্থী টার্গেট করুন (Click a Streak Cohort to Target):
          </span>
          <span className="text-slate-500">
            Total Registered: <strong>{users.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STREAK_SEGMENTS.filter((s) => s.id !== "custom").map((seg) => {
            const isSelected = targetStreakSegment === seg.id;
            const count = cohortCounts[seg.id] ?? 0;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => setTargetStreakSegment(seg.id)}
                className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-400 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {seg.badgeText}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {count} জন
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {seg.descriptionBn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {feedback}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 font-bold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Composer + Quick Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Push Notification Composer */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Send className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            নতুন পুশ নোটিফিকেশন পাঠান (Compose Push Notification)
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                নোটিফিকেশন শিরোনাম (Title) <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: 🔥 আপনার স্ট্রিক ০ হয়ে গেছে! আজই অনুশীলনে ফিরুন"
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                বিস্তারিত বার্তা (Message Body) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="নোটিফিকেশনের বিস্তারিত বার্তা লিখুন..."
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Streak Segment Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  টার্গেট স্ট্রিক গ্রুপ (Streak Target)
                </label>
                <select
                  value={targetStreakSegment}
                  onChange={(e) =>
                    setTargetStreakSegment(e.target.value as StreakTargetSegment)
                  }
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs"
                >
                  {STREAK_SEGMENTS.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.labelBn} ({cohortCounts[seg.id] ?? 0} জন)
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  নোটিফিকেশন ক্যাটাগরি (Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs"
                >
                  <option value="streak_alert">🔥 স্ট্রিক অ্যালার্ট (Streak Alert)</option>
                  <option value="exam_alert">📝 পরীক্ষার নোটিশ (Exam Alert)</option>
                  <option value="daily_challenge">⚡ ডেইলি চ্যালেঞ্জ (Daily Challenge)</option>
                  <option value="new_questions">📚 নতুন প্রশ্ন সংযোজন (New Questions)</option>
                  <option value="live_quiz">🎮 লাইভ কুইজ (Live Quiz)</option>
                  <option value="announcement">📢 সাধারণ ঘোষণা (Announcement)</option>
                </select>
              </div>
            </div>

            {/* Custom Streak Range Inputs */}
            {targetStreakSegment === "custom" && (
              <div className="p-3.5 rounded-xl border border-orange-200 dark:border-orange-800/70 bg-orange-50/50 dark:bg-orange-950/20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    সর্বনিম্ন স্ট্রিক দিন (Min Streak Days)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={minStreak}
                    onChange={(e) => setMinStreak(Math.max(0, Number(e.target.value)))}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    সর্বোচ্চ স্ট্রিক দিন (Max Streak Days)
                  </label>
                  <Input
                    type="number"
                    min={minStreak}
                    value={maxStreak}
                    onChange={(e) =>
                      setMaxStreak(Math.max(minStreak, Number(e.target.value)))
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Target Exam Track */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  টার্গেট পরীক্ষা (Target Exam Track)
                </label>
                <select
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs"
                >
                  <option value="all">সকল পরীক্ষার্থী (All Candidates)</option>
                  <option value="exam_bcs">বিসিএস প্রিলিমিনারি (BCS Preliminary)</option>
                  <option value="exam_bank">ব্যাংক জব (Bank Jobs)</option>
                  <option value="exam_primary">প্রাইমারি ও সরকারি চাকরি (Govt Jobs)</option>
                </select>
              </div>

              {/* Action Route on Tap */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  ক্লিক করলে কোন পেজে যাবে (Deep-Link Screen)
                </label>
                <select
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs"
                >
                  <option value="/practice">কাস্টম প্র্যাকটিস (/practice)</option>
                  <option value="/exams">মক টেস্ট ও বিসিএস পেপার (/exams)</option>
                  <option value="/question-bank">প্রশ্নব্যাংক (/question-bank)</option>
                  <option value="/live">লাইভ কুইজ (/live)</option>
                  <option value="/leaderboard">লিডারবোর্ড (/leaderboard)</option>
                  <option value="/dashboard">হোম ড্যাশবোর্ড (/dashboard)</option>
                </select>
              </div>
            </div>

            {/* Pin Banner Checkbox & Send Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <Pin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>ড্যাশবোর্ডে পিন ব্যানার হিসেবে দেখান (Pin to Dashboard)</span>
              </label>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSending}
                className="text-xs gap-2 font-bold px-5"
              >
                <Send className="h-3.5 w-3.5" />
                পুশ নোটিফিকেশন পাঠান (Send Push Alert)
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: 1-Click Quick Templates */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              ১-ক্লিক রেডি টেমপ্লেট (Quick Templates)
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            যেকোনো টেমপ্লেটে ক্লিক করলে কম্পোজার অটো-ফিল হয়ে যাবে:
          </p>

          <div className="space-y-2">
            {QUICK_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/60 dark:bg-slate-800/40 transition-all space-y-1"
              >
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {tpl.label}
                </div>
                <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                  {tpl.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {tpl.body}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sent Notifications History Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              পাঠানো নোটিফিকেশন তালিকা (Sent Push Notifications — {notifications.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              যেকোনো নোটিফিকেশন পুনরায় পুশ (Resend), ড্যাশবোর্ডে পিন/আনপিন অথবা ডিলিট করতে পারবেন।
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            এখনো কোনো পুশ নোটিফিকেশন পাঠানো হয়নি। উপরের ফর্ম বা কুইক টেমপ্লেট ব্যবহার করে প্রথম নোটিফিকেশন পাঠান!
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const catInfo =
                categoryLabels[n.category] || categoryLabels.announcement;
              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    n.isPinned
                      ? "border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/50"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold border ${catInfo.color}`}
                      >
                        {catInfo.label}
                      </span>

                      <span className="px-2 py-0.5 rounded-md font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800 flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {formatStreakTargetBadge(n)}
                      </span>

                      {n.isPinned && (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-indigo-600 text-white flex items-center gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned Banner
                        </span>
                      )}

                      {n.actionUrl && (
                        <span className="text-slate-400 font-mono">
                          → {n.actionUrl}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.body}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResend(n)}
                      className="text-xs gap-1.5 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    >
                      <Send className="h-3 w-3" />
                      পুনরায় পাঠান (Resend)
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePin(n)}
                      className="text-xs gap-1.5"
                    >
                      {n.isPinned ? (
                        <>
                          <PinOff className="h-3.5 w-3.5" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="h-3.5 w-3.5" />
                          Pin
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(n.id)}
                      className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 p-2"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
