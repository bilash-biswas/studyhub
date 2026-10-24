export type NotificationCategory =
  | "exam_alert"
  | "daily_challenge"
  | "streak_alert"
  | "new_questions"
  | "live_quiz"
  | "announcement";

export type StreakTargetSegment =
  | "all"
  | "streak_zero"
  | "streak_beginner"
  | "streak_rising"
  | "streak_champion"
  | "streak_legend"
  | "custom";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  targetExamId?: string; // "all" | "exam_bcs" | "exam_bank" | "exam_primary"
  targetStreakSegment?: StreakTargetSegment;
  minStreak?: number | null;
  maxStreak?: number | null;
  actionUrl?: string;
  isPinned?: boolean;
  priority?: "normal" | "high";
  createdBy: string;
  createdAt: any;
  sentAt?: any;
}
