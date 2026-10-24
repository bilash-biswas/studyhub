export interface StreakParams {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string | null; // Format: YYYY-MM-DD
  todayDate: string; // Format: YYYY-MM-DD
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  isNewStreakIncrement: boolean;
}

export type StreakStatus =
  | "practiced_today"
  | "at_risk_today"
  | "broken"
  | "inactive";

export interface ActiveStreakEvaluation {
  effectiveStreak: number;
  storedStreak: number;
  isExpired: boolean;
  status: StreakStatus;
  diffDays: number | null;
}

/**
 * Helper to get today's date formatted as YYYY-MM-DD in local time
 */
export function getFormattedDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Evaluates whether a user's stored streak is still active today or has expired to 0
 * because they did NOT practice continuously (missed yesterday or more: diffDays >= 2).
 */
export function evaluateActiveStreak({
  currentStreak,
  lastPracticeDate,
  todayDate = getFormattedDate(),
}: {
  currentStreak?: number | null;
  lastPracticeDate?: string | null;
  todayDate?: string;
}): ActiveStreakEvaluation {
  const storedStreak = Math.max(0, Number(currentStreak || 0));

  if (!lastPracticeDate || typeof lastPracticeDate !== "string") {
    return {
      effectiveStreak: 0,
      storedStreak,
      isExpired: storedStreak > 0,
      status: storedStreak > 0 ? "broken" : "inactive",
      diffDays: null,
    };
  }

  const lastTime = new Date(`${lastPracticeDate}T00:00:00Z`).getTime();
  const todayTime = new Date(`${todayDate}T00:00:00Z`).getTime();

  if (Number.isNaN(lastTime) || Number.isNaN(todayTime)) {
    return {
      effectiveStreak: 0,
      storedStreak,
      isExpired: storedStreak > 0,
      status: "inactive",
      diffDays: null,
    };
  }

  const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

  // Practiced today (or future timezone edge case <= 0)
  if (diffDays <= 0) {
    const active = Math.max(1, storedStreak);
    return {
      effectiveStreak: active,
      storedStreak,
      isExpired: false,
      status: "practiced_today",
      diffDays: 0,
    };
  }

  // Practiced yesterday: streak is still alive today, but user must practice before midnight
  if (diffDays === 1) {
    if (storedStreak <= 0) {
      return {
        effectiveStreak: 0,
        storedStreak: 0,
        isExpired: false,
        status: "inactive",
        diffDays: 1,
      };
    }
    return {
      effectiveStreak: storedStreak,
      storedStreak,
      isExpired: false,
      status: "at_risk_today",
      diffDays: 1,
    };
  }

  // diffDays >= 2: User missed at least 1 full calendar day -> Streak is broken and becomes 0!
  return {
    effectiveStreak: 0,
    storedStreak,
    isExpired: storedStreak > 0,
    status: "broken",
    diffDays,
  };
}

/**
 * Convenience helper to get the effective streak (0 if broken/inactive) from any UserProfile-like object.
 */
export function getEffectiveUserStreak(
  user?: {
    currentStreak?: number | null;
    streak?: number | null;
    lastPracticeDate?: string | null;
  } | null
): number {
  if (!user) return 0;
  const rawStreak = user.currentStreak ?? user.streak ?? 0;
  return evaluateActiveStreak({
    currentStreak: rawStreak,
    lastPracticeDate: user.lastPracticeDate,
  }).effectiveStreak;
}

/**
 * Calculates updated user streak when a user completes a practice/exam session today.
 * Rule:
 * - If practiced today already: streak unchanged (at least 1).
 * - If last practice was yesterday (diffDays === 1): increment effective streak by 1.
 * - If last practice was 2+ days ago (diffDays >= 2, so streak dropped to 0) or never: start streak at 1.
 * - Updates longestStreak = Math.max(longestStreak, updatedCurrentStreak).
 */
export function calculateNextStreak({
  currentStreak,
  longestStreak,
  lastPracticeDate,
  todayDate,
}: StreakParams): StreakResult {
  if (!lastPracticeDate) {
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastPracticeDate: todayDate,
      isNewStreakIncrement: true,
    };
  }

  // Already practiced today
  if (lastPracticeDate === todayDate) {
    const activeStreak = Math.max(1, currentStreak);
    return {
      currentStreak: activeStreak,
      longestStreak: Math.max(longestStreak, activeStreak),
      lastPracticeDate: todayDate,
      isNewStreakIncrement: false,
    };
  }

  // Parse dates as UTC to avoid timezone shift inconsistencies
  const lastTime = new Date(`${lastPracticeDate}T00:00:00Z`).getTime();
  const todayTime = new Date(`${todayDate}T00:00:00Z`).getTime();
  const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

  let updatedStreak: number;
  if (diffDays === 1) {
    // Consecutive day practice
    updatedStreak = Math.max(0, currentStreak) + 1;
  } else {
    // Gap of 2 or more days: streak had dropped to 0, so today's practice starts a fresh 1-day streak
    updatedStreak = 1;
  }

  const updatedLongest = Math.max(longestStreak, updatedStreak);

  return {
    currentStreak: updatedStreak,
    longestStreak: updatedLongest,
    lastPracticeDate: todayDate,
    isNewStreakIncrement: true,
  };
}
