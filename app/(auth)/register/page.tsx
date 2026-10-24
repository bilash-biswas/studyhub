"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/context/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { auth } from "@/lib/firebase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, user, loading } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [targetExam, setTargetExam] = useState("BCS");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError(
        t(
          "অনুগ্রহ করে সকল আবশ্যক ঘর পূরণ করুন।",
          "Please fill in all required fields."
        )
      );
      return;
    }

    if (password.length < 6) {
      setError(
        t(
          "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।",
          "Password must be at least 6 characters long."
        )
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(t("পাসওয়ার্ড দুটি মিলছে না।", "Passwords do not match."));
      return;
    }

    setIsSubmitting(true);
    const result = await signUpWithEmail(name, email, password);

    if (!result.success) {
      setError(
        result.error ||
          t(
            "অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
            "Failed to create account."
          )
      );
      setIsSubmitting(false);
    } else {
      // Save targetExam to Firestore profile if user is created
      try {
        if (auth.currentUser) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            targetExam,
          });
        }
      } catch {
        // non-blocking
      }
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    if (!result.success) {
      setError(
        result.error ||
          t("গুগল সাইন-আপ ব্যর্থ হয়েছে।", "Google sign-up failed.")
      );
      setIsGoogleLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("নতুন অ্যাকাউন্ট তৈরি করুন", "Create an account")}
        </CardTitle>
        <CardDescription>
          {t(
            "বিনামূল্যে আপনার বিসিএস ও সরকারি চাকরির প্রস্তুতি শুরু করুন",
            "Start your structured BCS & job preparation journey for free"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 p-3 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 font-medium gap-2.5"
          onClick={handleGoogleSignIn}
          isLoading={isGoogleLoading}
          disabled={isSubmitting}
        >
          {!isGoogleLoading && (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {t("গুগল দিয়ে সাইন আপ করুন", "Sign up with Google")}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#111827] px-2 text-slate-400 dark:text-slate-500">
              {t("অথবা ইমেইল দিয়ে নিবন্ধন করুন", "Or register with email")}
            </span>
          </div>
        </div>

        {/* Email Registration Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <Input
            label={t("পূর্ণ নাম (Full Name)", "Full Name")}
            type="text"
            placeholder={t("যেমন: বিলাশ বিশ্বাস (Bilash Biswas)", "e.g. Bilash Biswas")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            required
            autoComplete="name"
          />

          <Input
            label={t("ইমেইল অ্যাড্রেস", "Email Address")}
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
            autoComplete="email"
          />

          <div className="w-full space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("লক্ষ্য পরীক্ষা (Target Exam)", "Target Exam")}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              >
                <option value="BCS">
                  {t(
                    "বিসিএস প্রিলিমিনারি (BCS Preliminary)",
                    "BCS Preliminary"
                  )}
                </option>
                <option value="Bank">
                  {t(
                    "ব্যাংক জব নিয়োগ (Bank Job Recruitment)",
                    "Bank Job Recruitment"
                  )}
                </option>
                <option value="Primary">
                  {t(
                    "প্রাথমিক বিদ্যালয় সহকারী শিক্ষক (Primary)",
                    "Primary School Teacher"
                  )}
                </option>
                <option value="NTRCA">
                  {t(
                    " শিক্ষক নিবন্ধন (NTRCA)",
                    "NTRCA Teacher Registration"
                  )}
                </option>
                <option value="Other">
                  {t("অন্যান্য সরকারি চাকরি (Other Govt. Job)", "Other Govt. Job")}
                </option>
              </select>
            </div>
          </div>

          <Input
            label={t("পাসওয়ার্ড", "Password")}
            type={showPassword ? "text" : "password"}
            placeholder={t("অন্তত ৬ অক্ষর দিন", "At least 6 characters")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            required
            autoComplete="new-password"
          />

          <div className="space-y-1.5">
            <Input
              label={t("পাসওয়ার্ড নিশ্চিত করুন", "Confirm Password")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("পাসওয়ার্ডটি পুনরায় লিখুন", "Repeat your password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              required
              autoComplete="new-password"
            />

            {/* Live Password Match / Strength Feedback */}
            {passwordsMatch && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {t("পাসওয়ার্ড দুটি মিলেছে", "Passwords match")}
                </span>
              </p>
            )}
            {passwordsMismatch && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>
                  {t("পাসওয়ার্ড দুটি এখনো মেলেনি", "Passwords do not match yet")}
                </span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold mt-2"
            isLoading={isSubmitting}
            disabled={isGoogleLoading}
          >
            {t("অ্যাকাউন্ট তৈরি করুন", "Create Account")}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 px-2">
          {t(
            "অ্যাকাউন্ট তৈরি করার মাধ্যমে আপনি আমাদের শর্তাবলী ও গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন।",
            "By creating an account, you agree to our Terms of Service and Privacy Policy."
          )}
        </p>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t("ইতিমধ্যে অ্যাকাউন্ট আছে?", "Already have an account?")}{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("লগইন করুন", "Sign in")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
