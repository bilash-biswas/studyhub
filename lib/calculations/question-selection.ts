import { Question } from "@/types";

export interface QuestionSelectionOptions {
  count: number;
  examId?: string;
  subjectId?: string;
  difficulty?: "easy" | "medium" | "hard" | "all";
  tags?: string[];
}

/**
 * Pure function: Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Filters and deterministically selects N random questions from an available pool
 * without introducing duplicate questions.
 */
export function selectQuestions(
  pool: Question[],
  options: QuestionSelectionOptions
): Question[] {
  let filtered = pool.filter((q) => q.status === "published");

  if (options.examId) {
    filtered = filtered.filter((q) => q.examId === options.examId);
  }

  if (options.subjectId) {
    filtered = filtered.filter((q) => q.subjectId === options.subjectId);
  }

  if (options.difficulty && options.difficulty !== "all") {
    filtered = filtered.filter((q) => q.difficulty === options.difficulty);
  }

  if (options.tags && options.tags.length > 0) {
    const expandedTags = new Set<string>();
    options.tags.forEach((t) => {
      const clean = t.toLowerCase().trim();
      expandedTags.add(clean);
      expandedTags.add(clean.replace(/^(\d+(?:st|nd|rd|th))-bcs$/, "$1bcs-bcs"));
      expandedTags.add(clean.replace(/^(\d+(?:st|nd|rd|th))bcs-bcs$/, "$1-bcs"));
    });
    filtered = filtered.filter((q) =>
      q.tags.some((tag) => expandedTags.has(tag.toLowerCase().trim()))
    );
  }

  const shuffled = shuffleArray(filtered);
  const targetCount = Math.max(1, options.count);

  return shuffled.slice(0, targetCount);
}
