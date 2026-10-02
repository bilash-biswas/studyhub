import {
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  attemptsCol,
  userQuestionStatsCol,
  userQuestionStatDoc,
} from "@/lib/firebase/firestore";
import { Attempt } from "@/types";
import { calculateAccuracy } from "@/lib/calculations/accuracy";
import {
  AreaStats,
  ClassifiedArea,
  rankAreasByWeakness,
} from "@/lib/calculations/weakness";

export interface UserMistakeStat {
  questionId: string;
  isCorrect: boolean;
  lastAttemptAt?: any;
}

export interface UserAnalyticsOverview {
  totalAttempts: number;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  overallAccuracy: number;
  totalStudyTimeSeconds: number;
  rankedSubjects: ClassifiedArea[];
  rankedTags: ClassifiedArea[];
  weakAreas: ClassifiedArea[];
}

/**
 * Fetches all question IDs where the user's latest recorded answer was incorrect.
 */
export async function getUserMistakeQuestionIds(userId: string): Promise<string[]> {
  try {
    const q = query(
      userQuestionStatsCol(userId),
      where("isCorrect", "==", false)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().questionId || d.id);
  } catch (error) {
    console.error("Error fetching user mistake question IDs:", error);
    return [];
  }
}

/**
 * Fetches all mistake records with metadata for a user.
 */
export async function getUserMistakeStats(userId: string): Promise<UserMistakeStat[]> {
  try {
    const q = query(
      userQuestionStatsCol(userId),
      where("isCorrect", "==", false)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      questionId: d.data().questionId || d.id,
      isCorrect: d.data().isCorrect,
      lastAttemptAt: d.data().lastAttemptAt,
    }));
  } catch (error) {
    console.error("Error fetching user mistake stats:", error);
    return [];
  }
}

/**
 * Removes a question from the user's Mistake Bank (e.g. after mastering it or dismissing).
 */
export async function removeMistake(userId: string, questionId: string): Promise<void> {
  try {
    await deleteDoc(userQuestionStatDoc(userId, questionId));
  } catch (error) {
    console.error(`Error removing mistake ${questionId}:`, error);
    throw error;
  }
}

/**
 * Computes deep user analytics from the user's attempts history (up to recent 50 attempts).
 * Strictly guards Firestore read limits.
 */
export async function getUserAggregatedAnalytics(
  userId: string,
  subjectNameMap: Record<string, string> = {}
): Promise<UserAnalyticsOverview> {
  try {
    const q = query(
      attemptsCol(),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    const attempts = snap.docs.map((d) => d.data() as Attempt);

    let totalAnswered = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalSkipped = 0;
    let totalStudyTimeSeconds = 0;

    const subjectMap: Record<string, { attempts: number; correct: number }> = {};
    const tagMap: Record<string, { attempts: number; correct: number }> = {};

    for (const att of attempts) {
      totalAnswered += att.answeredQuestions || 0;
      totalCorrect += att.correctAnswers || 0;
      totalWrong += att.wrongAnswers || 0;
      totalSkipped += att.skippedQuestions || 0;
      totalStudyTimeSeconds += att.durationSeconds || 0;

      // Group by subject if subjectId exists
      if (att.subjectId) {
        if (!subjectMap[att.subjectId]) {
          subjectMap[att.subjectId] = { attempts: 0, correct: 0 };
        }
        subjectMap[att.subjectId].attempts += att.answeredQuestions || 0;
        subjectMap[att.subjectId].correct += att.correctAnswers || 0;
      }

      // Group by tags from answers
      if (att.answers && Array.isArray(att.answers)) {
        for (const ans of att.answers) {
          if (ans.tags && Array.isArray(ans.tags)) {
            for (const tag of ans.tags) {
              const cleanTag = tag.trim().toLowerCase();
              if (!cleanTag) continue;
              if (!tagMap[cleanTag]) {
                tagMap[cleanTag] = { attempts: 0, correct: 0 };
              }
              if (ans.selectedOptionId) {
                tagMap[cleanTag].attempts += 1;
                if (ans.isCorrect) {
                  tagMap[cleanTag].correct += 1;
                }
              }
            }
          }
        }
      }
    }

    const overallAccuracy = calculateAccuracy(totalCorrect, totalAnswered);

    // Build subject AreaStats
    const subjectAreas: AreaStats[] = Object.entries(subjectMap).map(
      ([subId, data]) => ({
        id: subId,
        name: subjectNameMap[subId] || subId,
        attempts: data.attempts,
        correct: data.correct,
      })
    );

    // Build tag AreaStats
    const tagAreas: AreaStats[] = Object.entries(tagMap).map(([tag, data]) => ({
      id: tag,
      name: `#${tag}`,
      attempts: data.attempts,
      correct: data.correct,
    }));

    const rankedSubjects = rankAreasByWeakness(subjectAreas);
    const rankedTags = rankAreasByWeakness(tagAreas);

    // Combined weak areas (tier === "weak" or tier === "needs_improvement")
    const weakAreas = [
      ...rankedSubjects.filter((s) => s.tier === "weak" || s.tier === "needs_improvement"),
      ...rankedTags.filter((t) => t.tier === "weak"),
    ];

    return {
      totalAttempts: attempts.length,
      totalAnswered,
      totalCorrect,
      totalWrong,
      totalSkipped,
      overallAccuracy,
      totalStudyTimeSeconds,
      rankedSubjects,
      rankedTags,
      weakAreas,
    };
  } catch (error) {
    console.error("Error computing user aggregated analytics:", error);
    return {
      totalAttempts: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalSkipped: 0,
      overallAccuracy: 0,
      totalStudyTimeSeconds: 0,
      rankedSubjects: [],
      rankedTags: [],
      weakAreas: [],
    };
  }
}
