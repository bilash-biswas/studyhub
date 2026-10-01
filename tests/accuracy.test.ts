import { describe, it, expect } from "vitest";
import { calculateAccuracy } from "../lib/calculations/accuracy";

describe("calculateAccuracy", () => {
  it("calculates accuracy correctly with clean numbers", () => {
    expect(calculateAccuracy(42, 50)).toBe(84);
    expect(calculateAccuracy(50, 50)).toBe(100);
    expect(calculateAccuracy(0, 50)).toBe(0);
  });

  it("handles fractions with 2 decimal precision", () => {
    // 1 / 3 = 33.33%
    expect(calculateAccuracy(1, 3)).toBe(33.33);
    // 2 / 3 = 66.67%
    expect(calculateAccuracy(2, 3)).toBe(66.67);
  });

  it("guards against zero division", () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
    expect(calculateAccuracy(5, 0)).toBe(0);
    expect(calculateAccuracy(-1, 0)).toBe(0);
  });
});
