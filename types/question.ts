export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "draft" | "published" | "archived";

export interface QuestionOption {
  id: string; // e.g. "a", "b", "c", "d"
  text: string; // supports mixed text + LaTeX (e.g. "$18$", "$\frac{3}{2}$")
}

export interface Question {
  id: string;
  examId: string;
  subjectId: string;
  question: string; // supports Bengali Unicode + mixed text + LaTeX (e.g. "যদি $x + \frac{1}{x} = 3$ হয়...")
  options: QuestionOption[];
  correctOptionId: string; // "a" | "b" | "c" | "d"
  explanation?: string; // Step-by-step solution with optional LaTeX formulas
  difficulty: QuestionDifficulty;
  year?: number | null;
  source?: string; // e.g. "45th BCS Preliminary", "Combined 8 Banks 2023"
  tags: string[]; // flexible tags e.g. ["algebra", "equations", "45th-bcs"]
  imageUrl?: string | null;
  status: QuestionStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: any;
  updatedAt: any;
}
