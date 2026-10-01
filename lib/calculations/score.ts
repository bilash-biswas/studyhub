export interface ScoreCalculationParams {
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  correctMark?: number;
  wrongMark?: number;
  allowNegative?: boolean;
}

export interface ScoreCalculationResult {
  score: number;
  maxScore: number;
  percentage: number;
}

/**
 * Deterministically calculates candidate score and percentage with negative marking.
 * Rounds to 2 decimal places to avoid IEEE-754 floating-point errors.
 */
export function calculateScore({
  correctCount,
  wrongCount,
  totalQuestions,
  correctMark = 1,
  wrongMark = 0,
  allowNegative = true,
}: ScoreCalculationParams): ScoreCalculationResult {
  const safeCorrect = Math.max(0, correctCount);
  const safeWrong = Math.max(0, wrongCount);
  const safeTotal = Math.max(1, totalQuestions);

  const rawScore = safeCorrect * correctMark - safeWrong * wrongMark;
  const score = allowNegative ? Math.round(rawScore * 100) / 100 : Math.max(0, Math.round(rawScore * 100) / 100);

  const maxScore = Math.round(safeTotal * correctMark * 100) / 100;
  const rawPercentage = maxScore > 0 ? (Math.max(0, score) / maxScore) * 100 : 0;
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage * 100) / 100));

  return {
    score,
    maxScore,
    percentage,
  };
}
