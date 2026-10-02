import {
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import {
  leaderboardScoresCol,
  leaderboardScoreDoc,
  db,
} from "@/lib/firebase/firestore";
import { LeaderboardEntry, LeaderboardPeriod } from "@/types";
import { getFormattedDate } from "@/lib/calculations/streak";
import { calculateAccuracy } from "@/lib/calculations/accuracy";

/**
 * Returns ISO week key string (e.g. "2026-W40")
 */
export function getWeeklyPeriodKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Fetches top leaderboard rankings for a period.
 * Strictly limited to top N (default 25) to protect Firestore read limits.
 */
export async function getLeaderboard(
  period: LeaderboardPeriod,
  customPeriodKey?: string,
  limitCount: number = 25
): Promise<LeaderboardEntry[]> {
  try {
    let periodKey = customPeriodKey;
    if (!periodKey) {
      if (period === "daily") periodKey = getFormattedDate();
      else if (period === "weekly") periodKey = getWeeklyPeriodKey();
      else periodKey = "all";
    }

    const q = query(
      leaderboardScoresCol(),
      where("period", "==", period),
      where("periodKey", "==", periodKey),
      orderBy("score", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error(`Error fetching leaderboard for ${period}:`, error);
    return [];
  }
}

export interface RecordScoreInput {
  userId: string;
  displayName: string;
  photoURL?: string | null;
  scoreToAdd: number;
  questionsAttempted: number;
  correctAnswers: number;
}

/**
 * Atomically updates user scores across Daily, Weekly, and All-Time leaderboards.
 * Uses atomic merge writes to strictly adhere to free-tier quotas.
 */
export async function recordLeaderboardScore(input: RecordScoreInput): Promise<void> {
  const todayDate = getFormattedDate();
  const weekKey = getWeeklyPeriodKey();
  const timestamp = serverTimestamp();

  const entries = [
    {
      period: "daily" as LeaderboardPeriod,
      periodKey: todayDate,
      docId: `daily_${todayDate}_${input.userId}`,
    },
    {
      period: "weekly" as LeaderboardPeriod,
      periodKey: weekKey,
      docId: `weekly_${weekKey}_${input.userId}`,
    },
    {
      period: "allTime" as LeaderboardPeriod,
      periodKey: "all",
      docId: `allTime_all_${input.userId}`,
    },
  ];

  try {
    const batch = writeBatch(db);

    for (const e of entries) {
      const docRef = leaderboardScoreDoc(e.docId);
      batch.set(
        docRef,
        {
          userId: input.userId,
          displayName: input.displayName || "Candidate",
          photoURL: input.photoURL || null,
          period: e.period,
          periodKey: e.periodKey,
          score: increment(input.scoreToAdd),
          questionsAttempted: increment(input.questionsAttempted),
          updatedAt: timestamp,
        },
        { merge: true }
      );
    }

    await batch.commit();
  } catch (error) {
    console.error("Error recording leaderboard score:", error);
  }
}
