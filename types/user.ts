export type UserRole = "user" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  isActive: boolean;
  totalAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string; // Format: YYYY-MM-DD
  createdAt: any; // Firebase Timestamp or ISO date string
  updatedAt: any;
}

export interface UserStatsSummary {
  totalAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
}
