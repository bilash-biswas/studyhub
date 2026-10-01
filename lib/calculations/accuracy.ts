/**
 * Deterministically calculates accuracy percentage (0.00% to 100.00%).
 * Safely guards against division by zero.
 */
export function calculateAccuracy(correctCount: number, answeredCount: number): number {
  if (answeredCount <= 0 || correctCount <= 0) {
    return 0;
  }
  const ratio = (correctCount / answeredCount) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio * 100) / 100));
}
