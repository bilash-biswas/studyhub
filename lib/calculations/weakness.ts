import { calculateAccuracy } from "./accuracy";

export type PerformanceTier = "weak" | "needs_improvement" | "good" | "strong";

export interface AreaPerformanceThresholds {
  minAttemptsForWeak: number; // default: 10
  weakAccuracyThreshold: number; // default: 60 (%)
  improvementThreshold: number; // default: 75 (%)
  goodThreshold: number; // default: 90 (%)
}

export const DEFAULT_THRESHOLDS: AreaPerformanceThresholds = {
  minAttemptsForWeak: 10,
  weakAccuracyThreshold: 60,
  improvementThreshold: 75,
  goodThreshold: 90,
};

export interface AreaStats {
  id: string; // subjectId or tag
  name: string;
  attempts: number;
  correct: number;
}

export interface ClassifiedArea extends AreaStats {
  accuracy: number;
  tier: PerformanceTier;
  label: string;
}

/**
 * Classifies performance tier based on attempt count and accuracy.
 * Rule:
 * - If attempts >= 10 and accuracy < 60% => "weak"
 * - If accuracy < 60% (attempts < 10) or accuracy < 75% => "needs_improvement"
 * - If 75% <= accuracy < 90% => "good"
 * - If accuracy >= 90% => "strong"
 */
export function classifyPerformance(
  attempts: number,
  correct: number,
  thresholds: AreaPerformanceThresholds = DEFAULT_THRESHOLDS
): { accuracy: number; tier: PerformanceTier; label: string } {
  const accuracy = calculateAccuracy(correct, attempts);

  if (attempts >= thresholds.minAttemptsForWeak && accuracy < thresholds.weakAccuracyThreshold) {
    return { accuracy, tier: "weak", label: "Weak Area" };
  }

  if (accuracy < thresholds.improvementThreshold) {
    return { accuracy, tier: "needs_improvement", label: "Needs Improvement" };
  }

  if (accuracy < thresholds.goodThreshold) {
    return { accuracy, tier: "good", label: "Good" };
  }

  return { accuracy, tier: "strong", label: "Strong" };
}

/**
 * Sorts areas to surface weakest areas first for targeted practice recommendations
 */
export function rankAreasByWeakness(
  areas: AreaStats[],
  thresholds: AreaPerformanceThresholds = DEFAULT_THRESHOLDS
): ClassifiedArea[] {
  return areas
    .map((area) => {
      const classification = classifyPerformance(area.attempts, area.correct, thresholds);
      return {
        ...area,
        ...classification,
      };
    })
    .sort((a, b) => {
      // Prioritize "weak" first, then by lowest accuracy, then by highest attempts
      const tierOrder: Record<PerformanceTier, number> = {
        weak: 0,
        needs_improvement: 1,
        good: 2,
        strong: 3,
      };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) {
        return tierOrder[a.tier] - tierOrder[b.tier];
      }
      return a.accuracy - b.accuracy;
    });
}
