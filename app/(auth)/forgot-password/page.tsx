"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
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

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(
        t(
          "অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল অ্যাড্রেস লিখুন।",
          "Please enter your registered email address."
        )
      );
      return;
    }

    setIsSubmitting(true);
    const result = await sendPasswordReset(email);
    setIsSubmitting(false);

    if (!result.success) {
      setError(
        result.error ||
          t(
            "পাসওয়ার্ড রিসেট ইমেইল পাঠানো যায়নি। আবার চেষ্টা করুন।",
            "Could not send password reset email. Please try again."
          )
      );
    } else {
      setIsSent(true);
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("পাসওয়ার্ড রিসেট করুন", "Reset your password")}
        </CardTitle>
        <CardDescription>
          {t(
            "আপনার নিবন্ধিত ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট করার লিঙ্ক পাঠিয়ে দেবো",
            "Enter your registered email and we'll send you a password reset link"
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

        {isSent ? (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 space-y-3 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {t(
                  "পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে!",
                  "Password Reset Link Sent!"
                )}
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                {t(
                  `আমরা ${email} ঠিকানায় একটি পাসওয়ার্ড রিসেট ইমেইল পাঠিয়েছি। অনুগ্রহ করে ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।`,
                  `We sent a password reset link to ${email}. Please check your inbox or spam folder.`
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSent(false)}
              className="mt-2"
            >
              {t("অন্য ইমেইল দিয়ে চেষ্টা করুন", "Try another email")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              isLoading={isSubmitting}
            >
              {t("রিসেট লিঙ্ক পাঠান", "Send Reset Link")}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("লগইন পেইজে ফিরে যান", "Back to Sign In")}
        </Link>
      </CardFooter>
    </Card>
  );
}
