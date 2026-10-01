import { describe, it, expect } from "vitest";
import { calculateExamTimer } from "../lib/calculations/timer";

describe("calculateExamTimer", () => {
  it("calculates initial timer correctly", () => {
    const startedAt = 1000000;
    const now = 1000000;
    const durationSeconds = 1800; // 30 minutes

    const result = calculateExamTimer({
      startedAtMs: startedAt,
      durationSeconds,
      nowMs: now,
    });

    expect(result.remainingSeconds).toBe(1800);
    expect(result.elapsedSeconds).toBe(0);
    expect(result.isExpired).toBe(false);
    expect(result.isWarning).toBe(false);
    expect(result.progressPercentage).toBe(0);
  });

  it("calculates midway state accurately", () => {
    const startedAt = 1000000;
    const now = 1000000 + 600 * 1000; // 10 minutes (600s) later
    const durationSeconds = 1800;

    const result = calculateExamTimer({
      startedAtMs: startedAt,
      durationSeconds,
      nowMs: now,
    });

    expect(result.remainingSeconds).toBe(1200);
    expect(result.elapsedSeconds).toBe(600);
    expect(result.isExpired).toBe(false);
    expect(result.isWarning).toBe(false);
    expect(result.progressPercentage).toBe(33.33);
  });

  it("triggers warning state when remaining time <= 5 minutes (300 seconds)", () => {
    const startedAt = 1000000;
    const now = 1000000 + 1600 * 1000; // 200s left
    const durationSeconds = 1800;

    const result = calculateExamTimer({
      startedAtMs: startedAt,
      durationSeconds,
      nowMs: now,
    });

    expect(result.remainingSeconds).toBe(200);
    expect(result.isWarning).toBe(true);
    expect(result.isExpired).toBe(false);
  });

  it("marks as expired and clamps to 0 when time elapsed exceeds duration", () => {
    const startedAt = 1000000;
    const now = 1000000 + 2000 * 1000; // 200s past duration
    const durationSeconds = 1800;

    const result = calculateExamTimer({
      startedAtMs: startedAt,
      durationSeconds,
      nowMs: now,
    });

    expect(result.remainingSeconds).toBe(0);
    expect(result.elapsedSeconds).toBe(2000);
    expect(result.isExpired).toBe(true);
    expect(result.progressPercentage).toBe(100);
  });
});
