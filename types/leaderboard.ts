export type LeaderboardPeriod = "daily" | "weekly" | "allTime";

export interface LeaderboardEntry {
  id: string; // e.g. `${period}_${periodKey}_${userId}`
  userId: string;
  displayName: string;
  photoURL?: string | null;
  period: LeaderboardPeriod;
  periodKey: string; // e.g. "YYYY-MM-DD", "YYYY-WW", or "all"
  score: number;
  questionsAttempted: number;
  accuracy: number;
  updatedAt: any;
}
