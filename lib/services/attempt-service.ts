import {
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  writeBatch,
  doc,
} from "firebase/firestore";
import { attemptsCol, attemptDoc, userQuestionStatDoc, db } from "@/lib/firebase/firestore";
import { Attempt, AttemptAnswer, ExamMode } from "@/types";
import { calculateScore } from "@/lib/calculations/score";
import { calculateAccuracy } from "@/lib/calculations/accuracy";

export interface CreateAttemptInput {
  userId: string;
  examId?: string;
  subjectId?: string;
  mockTestId?: string;
  mode: ExamMode;
  answers: AttemptAnswer[];
  durationSeconds: number;
  correctMark?: number;
  wrongMark?: number;
}

/**
 * Saves a completed exam, practice, or challenge attempt to Firestore.
 * Atomic batch operation:
 * 1. Creates `attempts/{attemptId}`
 * 2. Updates user question statistics in `users/{uid}/questionStats/{questionId}`
 * Strictly protects free-tier limits by executing everything in one single atomic write batch.
 */
export async function recordAttempt(input: CreateAttemptInput): Promise<string> {
  const totalQuestions = input.answers.length;
  let answeredQuestions = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedQuestions = 0;

  for (const ans of input.answers) {
    if (ans.selectedOptionId) {
      answeredQuestions++;
      if (ans.isCorrect) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    } else {
      skippedQuestions++;
    }
  }

  const correctMark = input.correctMark ?? 1;
  const wrongMark = input.wrongMark ?? (input.mode === "exam" ? 0.5 : 0);

  const { score, percentage } = calculateScore({
    correctCount: correctAnswers,
    wrongCount: wrongAnswers,
    totalQuestions,
    correctMark,
    wrongMark,
    allowNegative: input.mode === "exam",
  });

  const accuracy = calculateAccuracy(correctAnswers, answeredQuestions);
  const timestamp = serverTimestamp();

  // Create document reference for attempt
  const newAttemptRef = doc(attemptsCol());
  const attemptId = newAttemptRef.id;

  const attemptData: Omit<Attempt, "id"> = {
    userId: input.userId,
    examId: input.examId,
    subjectId: input.subjectId,
    mockTestId: input.mockTestId,
    mode: input.mode,
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    wrongAnswers,
    skippedQuestions,
    correctMark,
    wrongMark,
    score,
    percentage,
    accuracy,
    startedAt: timestamp,
    submittedAt: timestamp,
    durationSeconds: input.durationSeconds,
    answers: input.answers,
    createdAt: timestamp,
  };

  const batch = writeBatch(db);
  batch.set(newAttemptRef, attemptData);

  // Update question stats for answered questions
  for (const ans of input.answers) {
    if (ans.selectedOptionId) {
      const qStatRef = userQuestionStatDoc(input.userId, ans.questionId);
      batch.set(
        qStatRef,
        {
          questionId: ans.questionId,
          isCorrect: ans.isCorrect,
          lastAttemptAt: timestamp,
        },
        { merge: true }
      );
    }
  }

  await batch.commit();
  return attemptId;
}

/**
 * Fetches an attempt record by ID
 */
export async function getAttemptById(attemptId: string): Promise<Attempt | null> {
  try {
    const snap = await getDoc(attemptDoc(attemptId));
    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data(),
    } as Attempt;
  } catch (error) {
    console.error(`Error fetching attempt ${attemptId}:`, error);
    return null;
  }
}

/**
 * Fetches recent attempts for a user
 */
export async function getUserRecentAttempts(
  userId: string,
  maxCount: number = 10
): Promise<Attempt[]> {
  try {
    const q = query(
      attemptsCol(),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Attempt[];
  } catch (error) {
    console.error("Error fetching user attempts:", error);
    return [];
  }
}
