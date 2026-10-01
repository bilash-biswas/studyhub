import { z } from "zod";

export const questionOptionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  text: z.string().min(1, "Option text cannot be empty"),
});

export const questionSchema = z
  .object({
    examId: z.string().min(1, "Exam category is required"),
    subjectId: z.string().min(1, "Subject is required"),
    question: z
      .string()
      .min(3, "Question prompt must be at least 3 characters")
      .max(2000, "Question prompt is too long"),
    options: z
      .array(questionOptionSchema)
      .min(2, "At least 2 options are required")
      .max(6, "Maximum 6 options allowed"),
    correctOptionId: z.string().min(1, "Please select the correct option"),
    explanation: z.string().max(3000, "Explanation is too long").optional(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    year: z
      .number()
      .int()
      .min(1980, "Year must be 1980 or later")
      .max(new Date().getFullYear() + 1, "Invalid year")
      .optional()
      .nullable(),
    source: z.string().max(150, "Source is too long").optional(),
    tags: z.array(z.string().trim().toLowerCase()).min(1, "At least one tag is required"),
    imageUrl: z.string().url().optional().nullable(),
    status: z.enum(["draft", "published", "archived"]),
  })
  .refine((data) => data.options.some((opt) => opt.id === data.correctOptionId), {
    message: "The correct option must match one of the provided options",
    path: ["correctOptionId"],
  });

export type QuestionFormData = z.infer<typeof questionSchema>;
