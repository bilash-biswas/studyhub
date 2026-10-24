"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
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

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const { signInWithEmail, signInWithGoogle, user, loading } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(
        t(
          "অনুগ্রহ করে আপনার ইমেইল ও পাসওয়ার্ড লিখুন।",
          "Please enter both your email and password."
        )
      );
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithEmail(email, password);
    if (!result.success) {
      setError(
        result.error ||
          t(
            "সাইন ইন করতে ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড যাচাই করুন।",
            "Failed to sign in. Please check your credentials."
          )
      );
      setIsSubmitting(false);
    } else {
      router.push(redirectUrl);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    if (!result.success) {
      setError(
        result.error ||
          t("গুগল সাইন-ইন ব্যর্থ হয়েছে।", "Google sign-in failed.")
      );
      setIsGoogleLoading(false);
    } else {
      router.push(redirectUrl);
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("পুনরায় স্বাগতম", "Welcome back")}
        </CardTitle>
        <CardDescription>
          {t(
            "আপনার বিসিএস ও চাকরির প্রস্তুতি চালিয়ে যেতে সাইন ইন করুন",
            "Sign in to your account to continue your exam preparation"
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
          {t("গুগল দিয়ে লগইন করুন", "Continue with Google")}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#111827] px-2 text-slate-400 dark:text-slate-500">
              {t("অথবা ইমেইল দিয়ে লগইন করুন", "Or continue with email")}
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("পাসওয়ার্ড", "Password")}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t("পাসওয়ার্ড ভুলে গেছেন?", "Forgot password?")}
              </Link>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            isLoading={isSubmitting}
            disabled={isGoogleLoading}
          >
            {t("সাইন ইন করুন", "Sign In")}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t("এখনো কোনো অ্যাকাউন্ট নেই?", "Don't have an account?")}{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("নতুন অ্যাকাউন্ট খুলুন", "Create one")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
