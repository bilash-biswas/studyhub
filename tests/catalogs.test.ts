import { describe, it, expect } from "vitest";
import { DEFAULT_CATALOGS } from "../lib/services/seed-catalogs";
import { examSchema, subjectSchema } from "../lib/validations/catalogs";

describe("Catalog Models & Validation", () => {
  describe("DEFAULT_CATALOGS Structure", () => {
    it("contains the 3 primary Bangladesh career exam tracks: BCS, Bank Job, and Govt Jobs", () => {
      const slugs = DEFAULT_CATALOGS.map((e) => e.slug);
      expect(slugs).toContain("bcs");
      expect(slugs).toContain("bank-job");
      expect(slugs).toContain("govt-jobs");
    });

    it("has unique exam IDs and slugs", () => {
      const ids = DEFAULT_CATALOGS.map((e) => e.id);
      const slugs = DEFAULT_CATALOGS.map((e) => e.slug);

      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("has properly ordered subjects in each exam", () => {
      for (const exam of DEFAULT_CATALOGS) {
        expect(exam.subjects.length).toBeGreaterThan(0);
        const orders = exam.subjects.map((s) => s.order);
        const sorted = [...orders].sort((a, b) => a - b);
        expect(orders).toEqual(sorted);
      }
    });

    it("includes full 10-subject BCS Preliminary syllabus", () => {
      const bcs = DEFAULT_CATALOGS.find((e) => e.slug === "bcs");
      expect(bcs).toBeDefined();
      expect(bcs?.subjects.length).toBe(10);
      const names = bcs?.subjects.map((s) => s.name);
      expect(names).toContain("তথ্য ও যোগাযোগ প্রযুক্তি (ICT)");
      expect(names).toContain("বাংলা ভাষা ও সাহিত্য");
      expect(names).toContain("English Language & Literature");
    });
  });

  describe("examSchema Validation", () => {
    it("validates a well-formed exam", () => {
      const result = examSchema.safeParse({
        name: "University Admission",
        slug: "university-admission",
        description: "Public university admission question bank",
        order: 4,
        isActive: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid slugs with uppercase or special characters", () => {
      const result = examSchema.safeParse({
        name: "Admission Test",
        slug: "Admission_Test!",
        order: 4,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("lowercase letters");
      }
    });

    it("rejects negative order", () => {
      const result = examSchema.safeParse({
        name: "Admission",
        slug: "admission",
        order: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("subjectSchema Validation", () => {
    it("validates a well-formed subject", () => {
      const result = subjectSchema.safeParse({
        examId: "exam_bcs",
        name: "সাধারণ বিজ্ঞান",
        description: "General Science syllabus",
        order: 6,
        isActive: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects subject without examId", () => {
      const result = subjectSchema.safeParse({
        examId: "",
        name: "General Science",
        order: 1,
      });
      expect(result.success).toBe(false);
    });
  });
});
