"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Question } from "@/types";
import { getQuestionById } from "@/lib/services/question-service";
import { QuestionForm } from "@/components/admin/question-form";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.questionId as string;
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestion() {
      if (!questionId) return;
      setLoading(true);
      const data = await getQuestionById(questionId);
      setQuestion(data);
      setLoading(false);
    }
    loadQuestion();
  }, [questionId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading question details...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">Question Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested question (ID: {questionId}) could not be located in the question bank.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/questions")}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Question Bank
        </Button>
      </div>
    );
  }

  return <QuestionForm initialQuestion={question} isEdit={true} />;
}
