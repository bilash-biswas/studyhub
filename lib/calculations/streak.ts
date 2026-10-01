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

/**
 * Calculates updated user streak based on practice activity.
 * Rule:
 * - If practiced today already: streak unchanged.
 * - If last practice was yesterday: increment streak by 1.
 * - If last practice was 2+ days ago or never: reset streak to 1.
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
    return {
      currentStreak,
      longestStreak,
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
    updatedStreak = currentStreak + 1;
  } else {
    // Gap of 2 or more days, reset streak to 1
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

/**
 * Helper to get today's date formatted as YYYY-MM-DD in local time
 */
export function getFormattedDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
