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
  increment,
} from "firebase/firestore";
import { attemptsCol, attemptDoc, userQuestionStatDoc, userDoc, db } from "@/lib/firebase/firestore";
import { Attempt, AttemptAnswer, ExamMode } from "@/types";
import { calculateScore } from "@/lib/calculations/score";
import { calculateAccuracy } from "@/lib/calculations/accuracy";
import { calculateNextStreak, getFormattedDate } from "@/lib/calculations/streak";
import { recordLeaderboardScore } from "@/lib/services/leaderboard-service";

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

  const attemptData: Record<string, any> = {
    userId: input.userId,
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
    answers: input.answers.map((ans) => ({
      questionId: ans.questionId,
      selectedOptionId: ans.selectedOptionId ?? null,
      isCorrect: Boolean(ans.isCorrect),
      timeSpentSeconds: ans.timeSpentSeconds ?? 0,
    })),
    createdAt: timestamp,
  };

  if (input.examId) {
    attemptData.examId = input.examId;
  }
  if (input.subjectId) {
    attemptData.subjectId = input.subjectId;
  }
  if (input.mockTestId) {
    attemptData.mockTestId = input.mockTestId;
  }

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

  // Update user profile metrics & streak in the same atomic batch
  try {
    const userSnap = await getDoc(userDoc(input.userId));
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const streakRes = calculateNextStreak({
        currentStreak: userData.currentStreak || 0,
        longestStreak: userData.longestStreak || 0,
        lastPracticeDate: userData.lastPracticeDate || null,
        todayDate: getFormattedDate(),
      });

      const userUpdatePayload: Record<string, any> = {
        totalAttempts: increment(1),
        totalQuestionsAnswered: increment(answeredQuestions),
        totalCorrect: increment(correctAnswers),
        currentStreak: streakRes.currentStreak,
        longestStreak: streakRes.longestStreak,
        updatedAt: timestamp,
      };

      if (streakRes.lastPracticeDate) {
        userUpdatePayload.lastPracticeDate = streakRes.lastPracticeDate;
      }

      batch.update(userDoc(input.userId), userUpdatePayload);
    }
  } catch (err) {
    console.warn("Could not batch update user profile streak:", err);
  }

  await batch.commit();

  // Asynchronously record leaderboard points without blocking
  recordLeaderboardScore({
    userId: input.userId,
    displayName: "Candidate",
    scoreToAdd: Math.max(0, score),
    questionsAttempted: answeredQuestions,
    correctAnswers,
  }).catch((err) => {
    console.warn("Could not record leaderboard points:", err);
  });

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
    try {
      const fallbackQ = query(
        attemptsCol(),
        where("userId", "==", userId),
        limit(maxCount * 2)
      );
      const snap = await getDocs(fallbackQ);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Attempt[];
      return list.sort((a: any, b: any) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return tB - tA;
      }).slice(0, maxCount);
    } catch {
      console.error("Error fetching user attempts:", error);
      return [];
    }
  }
}
