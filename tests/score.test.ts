import { describe, it, expect } from "vitest";
import { calculateScore } from "../lib/calculations/score";

describe("calculateScore", () => {
  it("calculates standard score with 0 wrong mark", () => {
    const result = calculateScore({
      correctCount: 40,
      wrongCount: 10,
      totalQuestions: 50,
      correctMark: 1,
      wrongMark: 0,
    });
    expect(result.score).toBe(40);
    expect(result.maxScore).toBe(50);
    expect(result.percentage).toBe(80);
  });

  it("calculates BCS-style negative marking (0.5 mark deduction per wrong answer)", () => {
    // 50 questions, 42 correct, 6 wrong, 2 skipped
    // BCS typically has 0.5 deduction per wrong answer
    const result = calculateScore({
      correctCount: 42,
      wrongCount: 6,
      totalQuestions: 50,
      correctMark: 1,
      wrongMark: 0.5,
    });
    // 42 - (6 * 0.5) = 42 - 3 = 39
    expect(result.score).toBe(39);
    expect(result.percentage).toBe(78);
  });

  it("calculates Bank-style negative marking (0.25 mark deduction per wrong answer)", () => {
    // Prompt specification example:
    // 50 questions, 42 correct, 6 wrong, 2 skipped
    // correctMark = 1, wrongMark = 0.25
    // 42 - (6 * 0.25) = 42 - 1.5 = 40.5
    const result = calculateScore({
      correctCount: 42,
      wrongCount: 6,
      totalQuestions: 50,
      correctMark: 1,
      wrongMark: 0.25,
    });
    expect(result.score).toBe(40.5);
    expect(result.percentage).toBe(81);
  });

  it("handles negative scores correctly when allowNegative is true", () => {
    const result = calculateScore({
      correctCount: 1,
      wrongCount: 20,
      totalQuestions: 25,
      correctMark: 1,
      wrongMark: 0.5,
      allowNegative: true,
    });
    // 1 - 10 = -9
    expect(result.score).toBe(-9);
    expect(result.percentage).toBe(0);
  });

  it("clamps score to 0 when allowNegative is false", () => {
    const result = calculateScore({
      correctCount: 1,
      wrongCount: 20,
      totalQuestions: 25,
      correctMark: 1,
      wrongMark: 0.5,
      allowNegative: false,
    });
    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("safely handles 0 questions", () => {
    const result = calculateScore({
      correctCount: 0,
      wrongCount: 0,
      totalQuestions: 0,
    });
    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
  });
});
