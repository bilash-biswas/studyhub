"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setAuthError(null);
    setIsSubmitting(true);
    const result = await sendPasswordReset(data.email);
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setAuthError(result.error || "Could not send password reset email.");
    }
  };

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-center">
          Reset password
        </CardTitle>
        <CardDescription className="text-center text-xs">
          Enter your registered email address and we will send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authError && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <p className="flex-1">{authError}</p>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Reset Link Sent!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please check your email inbox and spam folder for instructions to reset your password.
              </p>
            </div>
            <Link href="/login" className="block pt-2">
              <Button variant="outline" className="w-full text-xs">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold"
              isLoading={isSubmitting}
            >
              Send Reset Link
            </Button>

            <div className="pt-2 text-center text-xs text-slate-500">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
