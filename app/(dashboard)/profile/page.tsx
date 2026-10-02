"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { updateDoc } from "firebase/firestore";
import { userDoc } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Flame,
  Award,
  Target,
  CheckCircle2,
  Calendar,
  LogOut,
  Mail,
  ShieldCheck,
  Edit2,
  Check,
  AlertCircle,
} from "lucide-react";
import { calculateAccuracy } from "@/lib/calculations/accuracy";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const [name, setName] = useState(profile?.name || user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalAnswered = profile?.totalQuestionsAnswered || 0;
  const totalCorrect = profile?.totalCorrect || 0;
  const accuracy = calculateAccuracy(totalCorrect, totalAnswered);

  const handleSaveName = async () => {
    if (!user || !name.trim()) return;
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfile(user, { displayName: name.trim() });
      await updateDoc(userDoc(user.uid), {
        name: name.trim(),
      });
      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setErrorMsg(err?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
            {(profile?.name || user?.displayName || user?.email || "U")
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {profile?.name || user?.displayName || "Candidate"}
              </h1>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  profile?.role === "admin"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                }`}
              >
                {profile?.role === "admin" ? "Administrator" : "Candidate"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5 shrink-0"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Questions Solved */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {totalAnswered}
          </div>
          <div className="text-xs text-slate-500 font-medium">Questions Solved</div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {accuracy}%
          </div>
          <div className="text-xs text-slate-500 font-medium">Overall Accuracy</div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
            <Flame className="h-6 w-6 fill-current" />
            <span>{profile?.currentStreak || 0}</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">Current Streak</div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
            <Award className="h-6 w-6" />
            <span>{profile?.longestStreak || 0}</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">Longest Streak</div>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Account Details
          </h2>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" />
              Edit Name
            </button>
          )}
        </div>

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Full Name
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="bg-[#4F46E5] text-white text-xs h-9 shrink-0"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="text-xs h-9 shrink-0"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 font-medium">
                {profile?.name || user?.displayName || "Candidate"}
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email Address
            </label>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 font-medium text-slate-500">
              {user?.email} (Google / Password Managed)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Total Attempts
              </label>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 font-medium">
                {profile?.totalAttempts || 0} Exam Sessions
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Last Practice Date
              </label>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 font-medium">
                {profile?.lastPracticeDate || "Not practiced yet"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
