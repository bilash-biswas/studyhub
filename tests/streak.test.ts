import { describe, it, expect } from "vitest";
import { calculateNextStreak } from "../lib/calculations/streak";

describe("calculateNextStreak", () => {
  it("initializes streak to 1 for new user with no previous practice", () => {
    const result = calculateNextStreak({
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      todayDate: "2026-10-01",
    });
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastPracticeDate).toBe("2026-10-01");
    expect(result.isNewStreakIncrement).toBe(true);
  });

  it("does not increment streak if already practiced today", () => {
    const result = calculateNextStreak({
      currentStreak: 5,
      longestStreak: 10,
      lastPracticeDate: "2026-10-01",
      todayDate: "2026-10-01",
    });
    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(10);
    expect(result.isNewStreakIncrement).toBe(false);
  });

  it("increments streak by 1 for consecutive day practice", () => {
    const result = calculateNextStreak({
      currentStreak: 5,
      longestStreak: 10,
      lastPracticeDate: "2026-09-30",
      todayDate: "2026-10-01",
    });
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(10);
    expect(result.isNewStreakIncrement).toBe(true);
  });

  it("updates longest streak when current streak exceeds it", () => {
    const result = calculateNextStreak({
      currentStreak: 10,
      longestStreak: 10,
      lastPracticeDate: "2026-09-30",
      todayDate: "2026-10-01",
    });
    expect(result.currentStreak).toBe(11);
    expect(result.longestStreak).toBe(11);
  });

  it("resets streak to 1 if user missed a day (gap >= 2 days)", () => {
    const result = calculateNextStreak({
      currentStreak: 15,
      longestStreak: 20,
      lastPracticeDate: "2026-09-25", // 6 days ago
      todayDate: "2026-10-01",
    });
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(20);
    expect(result.isNewStreakIncrement).toBe(true);
  });
});
