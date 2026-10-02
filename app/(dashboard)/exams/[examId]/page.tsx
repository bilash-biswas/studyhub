"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MockTest, Question, AttemptAnswer } from "@/types";
import { getMockTestById } from "@/lib/services/mock-test-service";
import {
  getQuestionsByIds,
  getQuestions,
  seedSampleQuestions,
} from "@/lib/services/question-service";
import { recordAttempt } from "@/lib/services/attempt-service";
import { useAuth } from "@/hooks/useAuth";
import { ExamRunner } from "@/components/exams/exam-runner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function TimedExamPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const testId = params.examId as string;

  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function initExam() {
      if (!testId) return;
      setLoading(true);
      try {
        const test = await getMockTestById(testId);
        if (!test) {
          setErrorMsg("Mock examination not found.");
          return;
        }
        setMockTest(test);

        let qList: Question[] = [];
        if (test.questionIds && test.questionIds.length > 0) {
          qList = await getQuestionsByIds(test.questionIds);
        }

        // If question pool is empty, fetch published questions for this exam
        if (qList.length === 0) {
          let res = await getQuestions({ examId: test.examId, status: "published" }, test.totalQuestions);
          if (res.questions.length === 0) {
            // Seed questions if empty
            await seedSampleQuestions(user?.uid || "system");
            res = await getQuestions({ status: "published" }, test.totalQuestions);
          }
          qList = res.questions.slice(0, test.totalQuestions);
        }

        if (qList.length === 0) {
          setErrorMsg("No questions available for this mock examination.");
        } else {
          setQuestions(qList);
        }
      } catch (err: any) {
        console.error("Failed to load exam session:", err);
        setErrorMsg(err?.message || "Error loading examination.");
      } finally {
        setLoading(false);
      }
    }

    initExam();
  }, [testId, user]);

  const handleComplete = async (answers: AttemptAnswer[], durationSeconds: number) => {
    if (!user || !mockTest) {
      router.push("/login");
      return;
    }

    try {
      const attemptId = await recordAttempt({
        userId: user.uid,
        examId: mockTest.examId,
        mockTestId: mockTest.id,
        mode: "exam",
        answers,
        durationSeconds,
        correctMark: mockTest.correctMark,
        wrongMark: mockTest.wrongMark,
      });

      router.push(`/results/${attemptId}`);
    } catch (err: any) {
      console.error("Failed to record exam attempt:", err);
      alert("Error submitting exam: " + (err?.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Preparing timed examination session...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !mockTest || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">Exam Unavailable</h2>
        <p className="text-xs text-slate-500">{errorMsg || "Unable to start exam session."}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/exams")}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Mock Tests
        </Button>
      </div>
    );
  }

  return (
    <ExamRunner
      test={mockTest}
      questions={questions}
      onComplete={handleComplete}
      onExit={() => router.push("/exams")}
    />
  );
}
