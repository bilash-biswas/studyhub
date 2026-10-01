export type ExamMode = "practice" | "exam" | "live" | "daily";

export interface AttemptAnswer {
  questionId: string;
  selectedOptionId?: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  tags?: string[];
}

export interface Attempt {
  id: string;
  userId: string;
  examId?: string;
  subjectId?: string;
  mockTestId?: string;
  mode: ExamMode;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  correctMark: number;
  wrongMark: number;
  score: number;
  percentage: number;
  accuracy: number;
  startedAt: any;
  submittedAt: any;
  durationSeconds: number;
  answers: AttemptAnswer[];
  createdAt: any;
}
