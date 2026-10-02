import {
  getDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import {
  dailyChallengeDoc,
  attemptsCol,
} from "@/lib/firebase/firestore";
import { DailyChallenge, Question, Attempt } from "@/types";
import { getFormattedDate } from "@/lib/calculations/streak";
import {
  getQuestions,
  getQuestionsByIds,
  seedSampleQuestions,
} from "@/lib/services/question-service";

/**
 * Fetches or automatically generates today's 5-question Daily Challenge.
 */
export async function getTodayDailyChallenge(): Promise<{
  challenge: DailyChallenge;
  questions: Question[];
}> {
  const today = getFormattedDate();
  const challengeRef = dailyChallengeDoc(today);

  try {
    const snap = await getDoc(challengeRef);

    if (snap.exists()) {
      const challenge = snap.data() as DailyChallenge;
      const questions = await getQuestionsByIds(challenge.questionIds);
      return { challenge, questions };
    }

    // Generate new Daily Challenge for today
    let res = await getQuestions({ status: "published" }, 20);
    if (res.questions.length === 0) {
      await seedSampleQuestions("system");
      res = await getQuestions({ status: "published" }, 20);
    }

    // Select 5 questions
    const selectedQuestions = res.questions.slice(0, 5);
    const questionIds = selectedQuestions.map((q) => q.id);

    const newChallenge: DailyChallenge = {
      date: today,
      title: `Daily Challenge — ${today}`,
      questionIds,
      totalQuestions: questionIds.length,
      createdAt: serverTimestamp(),
    };

    await setDoc(challengeRef, newChallenge);
    return { challenge: newChallenge, questions: selectedQuestions };
  } catch (error) {
    console.error("Error fetching/creating today's daily challenge:", error);
    throw error;
  }
}

/**
 * Checks if the user has already completed today's daily challenge.
 */
export async function hasUserCompletedDailyToday(
  userId: string,
  date: string = getFormattedDate()
): Promise<boolean> {
  try {
    const q = query(
      attemptsCol(),
      where("userId", "==", userId),
      where("mode", "==", "daily"),
      limit(5)
    );
    const snap = await getDocs(q);
    // Check if any attempt matches today's date in local time or attempt ID
    return snap.docs.some((d) => {
      const att = d.data() as Attempt;
      return att.mockTestId === `daily_${date}` || (att as any).dailyDate === date;
    });
  } catch (error) {
    console.error("Error checking user daily attempt:", error);
    return false;
  }
}
