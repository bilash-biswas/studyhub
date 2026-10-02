export interface TimerParams {
  startedAtMs: number;
  durationSeconds: number;
  nowMs?: number;
}

export interface TimerStatus {
  remainingSeconds: number;
  elapsedSeconds: number;
  isExpired: boolean;
  isWarning: boolean; // <= 5 minutes remaining
  progressPercentage: number; // 0 to 100
}

/**
 * Calculates remaining exam time deterministically using a timestamp anchor.
 * Immune to browser refresh or device sleeping.
 */
export function calculateExamTimer({
  startedAtMs,
  durationSeconds,
  nowMs = Date.now(),
}: TimerParams): TimerStatus {
  const elapsedSeconds = Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
  const isExpired = remainingSeconds <= 0;
  const isWarning = remainingSeconds > 0 && remainingSeconds <= 300; // <= 5 minutes
  const progressPercentage = durationSeconds > 0
    ? Math.min(100, Math.max(0, Math.round((elapsedSeconds / durationSeconds) * 10000) / 100))
    : 100;

  return {
    remainingSeconds,
    elapsedSeconds,
    isExpired,
    isWarning,
    progressPercentage,
  };
}

/**
 * Formats a duration in seconds into a human-readable mm:ss (or hh:mm:ss) string.
 */
export function formatTimer(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSecs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSecs)}`;
  }
  return `${pad(minutes)}:${pad(remainingSecs)}`;
}
