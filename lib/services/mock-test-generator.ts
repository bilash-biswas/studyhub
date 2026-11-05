import { getDocs, query, where, limit } from "firebase/firestore";
import { questionsCol } from "@/lib/firebase/firestore";
import { Question } from "@/types";

export interface BpscSubjectQuota {
  subjectId: string;
  nameBn: string;
  nameEn: string;
  quota: number;
}

/**
 * Official Bangladesh Public Service Commission (BPSC) 200-Mark Preliminary Syllabus Distribution
 */
export const BPSC_OFFICIAL_DISTRIBUTION: BpscSubjectQuota[] = [
  { subjectId: "sub_bcs_bangla", nameBn: "বাংলা ভাষা ও সাহিত্য", nameEn: "Bangla", quota: 35 },
  { subjectId: "sub_bcs_english", nameBn: "English Language & Literature", nameEn: "English", quota: 35 },
  { subjectId: "sub_bcs_bd_affairs", nameBn: "বাংলাদেশ বিষয়াবলী", nameEn: "Bangladesh Affairs", quota: 30 },
  { subjectId: "sub_bcs_intl_affairs", nameBn: "আন্তর্জাতিক বিষয়াবলী", nameEn: "International Affairs", quota: 20 },
  { subjectId: "sub_bcs_math", nameBn: "গাণিতিক যুক্তি", nameEn: "Mathematics", quota: 15 },
  { subjectId: "sub_bcs_mental_ability", nameBn: "মানসিক দক্ষতা", nameEn: "Mental Ability", quota: 15 },
  { subjectId: "sub_bcs_science", nameBn: "সাধারণ বিজ্ঞান", nameEn: "General Science", quota: 15 },
  { subjectId: "sub_bcs_ict", nameBn: "কম্পিউটার ও তথ্যপ্রযুক্তি", nameEn: "ICT", quota: 15 },
  { subjectId: "sub_bcs_geography", nameBn: "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা", nameEn: "Geography", quota: 10 },
  { subjectId: "sub_bcs_ethics", nameBn: "নৈতিকতা, মূল্যবোধ ও সুশাসন", nameEn: "Ethics & Governance", quota: 10 },
];

/**
 * Fisher-Yates array shuffler
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates an authentic 200-question BPSC Preliminary Mock Test
 * by selecting questions according to the official subject quotas.
 */
export async function generateBpscStandardQuestions(): Promise<{
  questions: Question[];
  quotaBreakdown: Record<string, number>;
}> {
  const selectedQuestions: Question[] = [];
  const quotaBreakdown: Record<string, number> = {};

  // Fetch questions for each subject in parallel
  const fetchPromises = BPSC_OFFICIAL_DISTRIBUTION.map(async (item) => {
    try {
      // Query up to 3x quota to ensure diverse random selection
      const q = query(
        questionsCol(),
        where("status", "==", "published"),
        where("subjectId", "==", item.subjectId),
        limit(item.quota * 4)
      );
      const snap = await getDocs(q);
      const pool = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question));
      const shuffled = shuffleArray(pool);
      const chosen = shuffled.slice(0, item.quota);

      return {
        subjectId: item.subjectId,
        chosen,
        count: chosen.length,
      };
    } catch (err) {
      console.error(`Error querying questions for ${item.subjectId}:`, err);
      return {
        subjectId: item.subjectId,
        chosen: [] as Question[],
        count: 0,
      };
    }
  });

  const results = await Promise.all(fetchPromises);

  for (const res of results) {
    selectedQuestions.push(...res.chosen);
    quotaBreakdown[res.subjectId] = res.count;
  }

  // Final shuffle so questions from different subjects are distributed realistically
  return {
    questions: shuffleArray(selectedQuestions),
    quotaBreakdown,
  };
}
