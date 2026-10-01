import { describe, it, expect } from "vitest";
import { questionSchema } from "../lib/validations/question";

describe("questionSchema Validation", () => {
  it("validates a complete question with math equations and Bengali content", () => {
    const validData = {
      examId: "exam_bcs",
      subjectId: "sub_bcs_math",
      question: "যদি $x + \\frac{1}{x} = 3$ হয়, তবে $x^3 + \\frac{1}{x^3}$ এর মান কত?",
      options: [
        { id: "a", text: "$18$" },
        { id: "b", text: "$27$" },
        { id: "c", text: "$36$" },
        { id: "d", text: "$9$" },
      ],
      correctOptionId: "a",
      explanation: "$x^3 + \\frac{1}{x^3} = (x + \\frac{1}{x})^3 - 3(x + \\frac{1}{x}) = 3^3 - 3(3) = 27 - 9 = 18$।",
      difficulty: "medium" as const,
      year: 2023,
      source: "45th BCS Preliminary",
      tags: ["algebra", "equations", "45th-bcs"],
      status: "published" as const,
    };

    const result = questionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects question when correctOptionId does not match any option", () => {
    const invalidData = {
      examId: "exam_bcs",
      subjectId: "sub_bcs_ict",
      question: "Which protocol operates at the Transport Layer?",
      options: [
        { id: "a", text: "IP" },
        { id: "b", text: "TCP" },
      ],
      correctOptionId: "c", // Not in options!
      difficulty: "easy" as const,
      tags: ["networking"],
      status: "published" as const,
    };

    const result = questionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("correct option must match");
    }
  });

  it("rejects question with less than 2 options", () => {
    const invalidData = {
      examId: "exam_bcs",
      subjectId: "sub_bcs_ict",
      question: "What is IPv4 address size?",
      options: [{ id: "a", text: "32 bits" }],
      correctOptionId: "a",
      difficulty: "easy" as const,
      tags: ["networking"],
      status: "published" as const,
    };

    const result = questionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects question without tags", () => {
    const invalidData = {
      examId: "exam_bcs",
      subjectId: "sub_bcs_ict",
      question: "What is IPv4 address size?",
      options: [
        { id: "a", text: "32 bits" },
        { id: "b", text: "64 bits" },
      ],
      correctOptionId: "a",
      difficulty: "easy" as const,
      tags: [], // empty tags!
      status: "published" as const,
    };

    const result = questionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
