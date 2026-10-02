"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Question, Exam, Subject, AttemptAnswer } from "@/types";
import { getQuestions, getQuestionsByIds, seedSampleQuestions } from "@/lib/services/question-service";
import { selectQuestions } from "@/lib/calculations/question-selection";
import { getExamById } from "@/lib/services/exam-service";
import { getSubjectById } from "@/lib/services/subject-service";
import { recordAttempt } from "@/lib/services/attempt-service";
import { useAuth } from "@/hooks/useAuth";
import { QuestionRunner } from "@/components/practice/question-runner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function PracticeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [feedbackMode, setFeedbackMode] = useState<"instant" | "exam">("instant");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function initSession() {
      setLoading(true);
      try {
        let config = {
          examId: "exam_bcs",
          subjectId: undefined as string | undefined,
          difficulty: "all" as "easy" | "medium" | "hard" | "all",
          count: 10,
          feedbackMode: "instant" as "instant" | "exam",
        };

        if (typeof window !== "undefined") {
          const stored = sessionStorage.getItem(`session_${sessionId}`);
          if (stored) {
            try {
              config = { ...config, ...JSON.parse(stored) };
            } catch (e) {
              console.error("Failed to parse stored session config", e);
            }
          }
        }

        setFeedbackMode(config.feedbackMode);

        // Fetch Exam and Subject metadata
        if (config.examId) {
          const ex = await getExamById(config.examId);
          setExam(ex);
        }
        if (config.subjectId) {
          const sub = await getSubjectById(config.subjectId);
          setSubject(sub);
        }

        // If explicit question IDs are provided (e.g. practicing mistakes or bookmarks)
        if (
          (config as any).questionIds &&
          Array.isArray((config as any).questionIds) &&
          (config as any).questionIds.length > 0
        ) {
          const targeted = await getQuestionsByIds((config as any).questionIds);
          if (targeted.length === 0) {
            setErrorMsg("Could not load the targeted practice questions.");
          } else {
            setQuestions(targeted);
          }
        } else {
          // Fetch published questions matching filters
          const filters: any = { status: "published" };
          if (config.examId) filters.examId = config.examId;
          if (config.subjectId) filters.subjectId = config.subjectId;
          if (config.difficulty && config.difficulty !== "all") {
            filters.difficulty = config.difficulty;
          }

          let res = await getQuestions(filters, 50);

          // If pool is empty, auto-seed sample questions and refetch
          if (res.questions.length === 0) {
            await seedSampleQuestions(user?.uid || "system");
            res = await getQuestions({ status: "published" }, 50);
          }

          // Deterministically select N questions using Fisher-Yates shuffle
          const selected = selectQuestions(res.questions, {
            count: config.count,
            examId: config.examId,
            subjectId: config.subjectId,
            difficulty: config.difficulty,
          });

          if (selected.length === 0) {
            setErrorMsg("No questions found matching your selected criteria. Try another subject.");
          } else {
            setQuestions(selected);
          }
        }
      } catch (err: any) {
        console.error("Session initialization failed:", err);
        setErrorMsg(err?.message || "Failed to load practice questions.");
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, [sessionId, user]);

  const handleComplete = async (answers: AttemptAnswer[], durationSeconds: number) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const attemptId = await recordAttempt({
        userId: user.uid,
        examId: exam?.id,
        subjectId: subject?.id,
        mode: "practice",
        answers,
        durationSeconds,
        correctMark: 1,
        wrongMark: 0, // Practice mode has no negative marking
      });

      // Clear session config
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`session_${sessionId}`);
      }

      router.push(`/results/${attemptId}`);
    } catch (err: any) {
      console.error("Failed to record attempt:", err);
      alert("Error saving practice attempt: " + (err?.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Preparing practice questions...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">No Questions Available</h2>
        <p className="text-xs text-slate-500">{errorMsg || "Please adjust your practice filters."}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/practice")}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Practice Setup
        </Button>
      </div>
    );
  }

  return (
    <QuestionRunner
      questions={questions}
      feedbackMode={feedbackMode}
      onComplete={handleComplete}
      examTitle={exam?.name}
      subjectTitle={subject?.name}
      onExit={() => router.push("/practice")}
    />
  );
}
