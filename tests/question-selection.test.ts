import { describe, it, expect } from "vitest";
import { selectQuestions, shuffleArray } from "../lib/calculations/question-selection";
import { Question } from "../types";

const mockPool: Question[] = [
  {
    id: "q1",
    examId: "exam_bcs",
    subjectId: "sub_bcs_math",
    question: "Math Q1",
    options: [{ id: "a", text: "1" }, { id: "b", text: "2" }],
    correctOptionId: "a",
    difficulty: "easy",
    tags: ["algebra"],
    status: "published",
    createdBy: "admin",
    updatedBy: "admin",
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "q2",
    examId: "exam_bcs",
    subjectId: "sub_bcs_math",
    question: "Math Q2",
    options: [{ id: "a", text: "3" }, { id: "b", text: "4" }],
    correctOptionId: "b",
    difficulty: "medium",
    tags: ["algebra", "geometry"],
    status: "published",
    createdBy: "admin",
    updatedBy: "admin",
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "q3",
    examId: "exam_bcs",
    subjectId: "sub_bcs_ict",
    question: "ICT Q1",
    options: [{ id: "a", text: "IP" }, { id: "b", text: "TCP" }],
    correctOptionId: "a",
    difficulty: "hard",
    tags: ["networking"],
    status: "published",
    createdBy: "admin",
    updatedBy: "admin",
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "q4",
    examId: "exam_bank",
    subjectId: "sub_bank_math",
    question: "Bank Q1",
    options: [{ id: "a", text: "10" }, { id: "b", text: "20" }],
    correctOptionId: "a",
    difficulty: "easy",
    tags: ["percentage"],
    status: "draft", // DRAFT: should never be selected!
    createdBy: "admin",
    updatedBy: "admin",
    createdAt: null,
    updatedAt: null,
  },
];

describe("Question Selection & Shuffling", () => {
  it("filters out draft or archived questions", () => {
    const selected = selectQuestions(mockPool, { count: 10 });
    const ids = selected.map((q) => q.id);
    expect(ids).not.toContain("q4");
    expect(selected.length).toBe(3);
  });

  it("filters strictly by examId and subjectId", () => {
    const selected = selectQuestions(mockPool, {
      count: 5,
      examId: "exam_bcs",
      subjectId: "sub_bcs_ict",
    });
    expect(selected.length).toBe(1);
    expect(selected[0].id).toBe("q3");
  });

  it("filters by difficulty", () => {
    const selected = selectQuestions(mockPool, {
      count: 5,
      difficulty: "medium",
    });
    expect(selected.length).toBe(1);
    expect(selected[0].id).toBe("q2");
  });

  it("filters by tags", () => {
    const selected = selectQuestions(mockPool, {
      count: 5,
      tags: ["geometry"],
    });
    expect(selected.length).toBe(1);
    expect(selected[0].id).toBe("q2");
  });

  it("respects requested count limit and avoids duplicates", () => {
    const selected = selectQuestions(mockPool, { count: 2 });
    expect(selected.length).toBe(2);
    const uniqueIds = new Set(selected.map((q) => q.id));
    expect(uniqueIds.size).toBe(2);
  });

  it("shuffleArray preserves all elements", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(items);
    expect(shuffled.length).toBe(5);
    expect(new Set(shuffled)).toEqual(new Set(items));
  });
});
