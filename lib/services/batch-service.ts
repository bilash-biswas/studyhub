import { getDocs, query, where, limit, QueryConstraint } from "firebase/firestore";
import { questionsCol } from "@/lib/firebase/firestore";
import { Question } from "@/types";
import { BCS_BATCHES, BcsBatchOption } from "@/lib/constants/bcs-batches";

/**
 * Normalizes batch slug variants (e.g. "45th-bcs-preliminary", "45thbcs", "45") to canonical batch ID ("45th-bcs").
 */
export function normalizeBatchSlug(slug: string): string {
  if (!slug) return "";
  const cleaned = slug.toLowerCase().trim();
  const match = cleaned.match(/(\d+)/);
  if (!match) return cleaned;

  const num = match[1];
  let suffix = "th";
  if (num.endsWith("1") && num !== "11") suffix = "st";
  else if (num.endsWith("2") && num !== "12") suffix = "nd";
  else if (num.endsWith("3") && num !== "13") suffix = "rd";

  return `${num}${suffix}-bcs`;
}

/**
 * Returns tag search variants for a given batch ID.
 */
export function getBatchTagVariants(batchId: string): string[] {
  const norm = normalizeBatchSlug(batchId);
  const match = norm.match(/^(\d+)(?:st|nd|rd|th)?-bcs$/);
  if (match) {
    const num = match[1];
    let suffix = "th";
    if (num.endsWith("1") && num !== "11") suffix = "st";
    else if (num.endsWith("2") && num !== "12") suffix = "nd";
    else if (num.endsWith("3") && num !== "13") suffix = "rd";

    return [
      `${num}${suffix}-bcs`,
      `${num}${suffix}bcs`,
      `${num}${suffix}bcs-bcs`,
      `#${num}${suffix}-bcs`,
      `#${num}${suffix}bcs`,
      `#${num}${suffix}bcs-bcs`,
    ];
  }
  return [norm, `#${norm}`];
}

/**
 * Retrieves the batch configuration from BCS_BATCHES.
 */
export function getBatchMeta(batchId: string): BcsBatchOption | null {
  const normalizedId = normalizeBatchSlug(batchId);
  return BCS_BATCHES.find((b) => b.id === normalizedId) || null;
}

/**
 * Fetches all published questions for a specific BCS batch.
 */
export async function getQuestionsForBatch(
  batchId: string,
  maxQuestions: number = 250
): Promise<Question[]> {
  try {
    const tagVariants = getBatchTagVariants(batchId);
    const constraints: QueryConstraint[] = [
      where("status", "==", "published"),
      where("tags", "array-contains-any", tagVariants),
      limit(maxQuestions),
    ];

    const q = query(questionsCol(), ...constraints);
    const snap = await getDocs(q);

    let questions = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Question[];

    // Fallback: If tag array-contains-any returned 0, search by source field prefix
    if (questions.length === 0) {
      const meta = getBatchMeta(batchId);
      const match = normalizeBatchSlug(batchId).match(/(\d+)/);
      const batchNum = match ? match[1] : "";

      if (batchNum) {
        const fallbackQ = query(
          questionsCol(),
          where("status", "==", "published"),
          limit(maxQuestions)
        );
        const fallbackSnap = await getDocs(fallbackQ);
        questions = fallbackSnap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Question))
          .filter((item) => {
            const src = (item.source || "").toLowerCase();
            const tags = (item.tags || []).map((t) => t.toLowerCase());
            return (
              src.includes(`${batchNum}th bcs`) ||
              src.includes(`${batchNum}তম বিসিএস`) ||
              tags.some((t) => t.includes(`${batchNum}th`) || t.includes(`${batchNum}bcs`))
            );
          });
      }
    }

    return questions;
  } catch (error) {
    console.error(`Error fetching questions for batch ${batchId}:`, error);
    return [];
  }
}
