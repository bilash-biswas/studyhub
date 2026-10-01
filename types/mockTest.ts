export interface MockTest {
  id: string;
  examId: string;
  title: string; // e.g. "46th BCS Special Model Test 01"
  description?: string;
  durationMinutes: number; // e.g. 60
  totalQuestions: number;
  questionIds: string[];
  correctMark: number; // e.g. 1.0
  wrongMark: number; // e.g. 0.5 for BCS, 0.25 for Bank
  passPercentage: number; // e.g. 50
  isPublished: boolean;
  createdAt: any;
  updatedAt: any;
}
