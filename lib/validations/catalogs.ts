import { z } from "zod";

export const examSchema = z.object({
  name: z
    .string()
    .min(2, "Exam name must be at least 2 characters")
    .max(100, "Exam name is too long"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(300, "Description is too long").optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0, "Order must be a positive number").default(0),
  isActive: z.boolean().default(true),
});

export type ExamFormData = z.infer<typeof examSchema>;

export const subjectSchema = z.object({
  examId: z.string().min(1, "Exam ID is required"),
  name: z
    .string()
    .min(2, "Subject name must be at least 2 characters")
    .max(120, "Subject name is too long"),
  description: z.string().max(300, "Description is too long").optional(),
  order: z.number().int().min(0, "Order must be a positive number").default(0),
  isActive: z.boolean().default(true),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
