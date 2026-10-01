import { describe, it, expect } from "vitest";
import { classifyPerformance, rankAreasByWeakness, AreaStats } from "../lib/calculations/weakness";

describe("classifyPerformance", () => {
  it("marks as weak when attempts >= 10 and accuracy < 60%", () => {
    // 15 attempts, 6 correct = 40% accuracy
    const result = classifyPerformance(15, 6);
    expect(result.tier).toBe("weak");
    expect(result.accuracy).toBe(40);
  });

  it("marks as needs_improvement when attempts < 10 but accuracy < 60%", () => {
    // 5 attempts, 2 correct = 40% accuracy
    const result = classifyPerformance(5, 2);
    expect(result.tier).toBe("needs_improvement");
  });

  it("marks as needs_improvement when 60% <= accuracy < 75%", () => {
    // 20 attempts, 14 correct = 70% accuracy
    const result = classifyPerformance(20, 14);
    expect(result.tier).toBe("needs_improvement");
  });

  it("marks as good when 75% <= accuracy < 90%", () => {
    // 20 attempts, 16 correct = 80% accuracy
    const result = classifyPerformance(20, 16);
    expect(result.tier).toBe("good");
  });

  it("marks as strong when accuracy >= 90%", () => {
    // 20 attempts, 19 correct = 95% accuracy
    const result = classifyPerformance(20, 19);
    expect(result.tier).toBe("strong");
  });
});

describe("rankAreasByWeakness", () => {
  it("prioritizes weak tier over higher tiers and sorts by accuracy", () => {
    const areas: AreaStats[] = [
      { id: "1", name: "ICT", attempts: 30, correct: 27 }, // 90% -> strong
      { id: "2", name: "Math", attempts: 12, correct: 5 }, // 41.67% -> weak
      { id: "3", name: "English", attempts: 20, correct: 15 }, // 75% -> good
      { id: "4", name: "International Affairs", attempts: 15, correct: 7 }, // 46.67% -> weak
    ];

    const ranked = rankAreasByWeakness(areas);
    // Both Math and International are weak, Math has lower accuracy (41.67% < 46.67%)
    expect(ranked[0].name).toBe("Math");
    expect(ranked[0].tier).toBe("weak");
    expect(ranked[1].name).toBe("International Affairs");
    expect(ranked[1].tier).toBe("weak");
    expect(ranked[2].name).toBe("English");
    expect(ranked[3].name).toBe("ICT");
  });
});
