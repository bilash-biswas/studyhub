import {
  getDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import {
  dailyChallengeDoc,
  attemptsCol,
  questionsCol,
} from "@/lib/firebase/firestore";
import { DailyChallenge, Question, Attempt } from "@/types";
import { getFormattedDate } from "@/lib/calculations/streak";
import { getQuestionsByIds } from "@/lib/services/question-service";

/**
 * Deterministic hash from date string (e.g. "2026-11-05")
 */
function getDateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 5 Core BPSC Subject Pillars for daily balanced examination:
 * 1. Language: Bangla or English
 * 2. National: Bangladesh Affairs
 * 3. Global & Geo: International Affairs or Geography
 * 4. STEM: Mathematics or General Science
 * 5. Applied: ICT, Mental Ability, or Ethics
 */
export function getDailySubjectPillars(dateStr: string = getFormattedDate()): string[] {
  const seed = getDateSeed(dateStr);

  const p1 = seed % 2 === 0 ? "sub_bcs_bangla" : "sub_bcs_english";
  const p2 = "sub_bcs_bd_affairs";
  const p3 = (seed >> 2) % 2 === 0 ? "sub_bcs_intl_affairs" : "sub_bcs_geography";
  const p4 = (seed >> 4) % 2 === 0 ? "sub_bcs_math" : "sub_bcs_science";

  const appliedPool = ["sub_bcs_ict", "sub_bcs_mental_ability", "sub_bcs_ethics"];
  const p5 = appliedPool[(seed >> 6) % appliedPool.length];

  return [p1, p2, p3, p4, p5];
}

/**
 * Generates 5 diverse questions for the given date across the 5 pillars.
 */
export async function generateDiverseDailyQuestions(dateStr: string = getFormattedDate()): Promise<Question[]> {
  const pillars = getDailySubjectPillars(dateStr);
  const seed = getDateSeed(dateStr);
  const selectedQuestions: Question[] = [];

  const promises = pillars.map(async (subjectId, pillarIndex) => {
    try {
      const q = query(
        questionsCol(),
        where("status", "==", "published"),
        where("subjectId", "==", subjectId),
        limit(25)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question));
      if (docs.length === 0) return null;

      // Prefer adminVerified if available
      const verified = docs.filter((item) => item.adminVerified === true);
      const pool = verified.length > 0 ? verified : docs;

      // Deterministic pick based on seed and pillar index
      const pickIndex = (seed + pillarIndex * 13) % pool.length;
      return pool[pickIndex];
    } catch (err) {
      console.error(`Error querying daily question for subject ${subjectId}:`, err);
      return null;
    }
  });

  const results = await Promise.all(promises);
  for (const item of results) {
    if (item) selectedQuestions.push(item);
  }

  // Fallback: If any pillar returned empty, fill up to 5 with general published questions
  if (selectedQuestions.length < 5) {
    try {
      const fallbackQ = query(
        questionsCol(),
        where("status", "==", "published"),
        limit(15)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      const existingIds = new Set(selectedQuestions.map((q) => q.id));
      for (const d of fallbackSnap.docs) {
        if (selectedQuestions.length >= 5) break;
        if (!existingIds.has(d.id)) {
          selectedQuestions.push({ id: d.id, ...d.data() } as Question);
        }
      }
    } catch (err) {
      console.error("Fallback query failed:", err);
    }
  }

  // Final Guarantee: If Firestore quota is exceeded or network is offline, ensure 5 verified questions
  if (selectedQuestions.length < 5) {
    for (const fb of FALLBACK_DAILY_QUESTIONS) {
      if (selectedQuestions.length >= 5) break;
      if (!selectedQuestions.some((q) => q.id === fb.id)) {
        selectedQuestions.push(fb);
      }
    }
  }

  return selectedQuestions;
}

const FALLBACK_DAILY_QUESTIONS: Question[] = [
  {
    id: "dc_fb_bn_1",
    examId: "exam_bcs",
    subjectId: "sub_bcs_bangla",
    question: "চর্যাপদ কত সালে আবিষ্কৃত হয়?",
    options: [
      { id: "a", text: "১৯০৭ সালে" },
      { id: "b", text: "১৯০৯ সালে" },
      { id: "c", text: "১৯১৬ সালে" },
      { id: "d", text: "১৯২৩ সালে" },
    ],
    correctOptionId: "a",
    explanation: "মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপালের রাজদরবারের রয়েল লাইব্রেরি থেকে চর্যাপদের মূল পুঁথি আবিষ্কার করেন।",
    difficulty: "medium",
    status: "published",
    adminVerified: true,
    tags: ["46th-bcs", "bangla"],
    createdBy: "system",
    updatedBy: "system",
    createdAt: null as any,
    updatedAt: null as any,
  },
  {
    id: "dc_fb_en_1",
    examId: "exam_bcs",
    subjectId: "sub_bcs_english",
    question: "Who wrote the play \"The Tempest\"?",
    options: [
      { id: "a", text: "William Shakespeare" },
      { id: "b", text: "Christopher Marlowe" },
      { id: "c", text: "Ben Jonson" },
      { id: "d", text: "John Webster" },
    ],
    correctOptionId: "a",
    explanation: "\"The Tempest\" is a renowned play written by William Shakespeare.",
    difficulty: "medium",
    status: "published",
    adminVerified: true,
    tags: ["45th-bcs", "english"],
    createdBy: "system",
    updatedBy: "system",
    createdAt: null as any,
    updatedAt: null as any,
  },
  {
    id: "dc_fb_math_1",
    examId: "exam_bcs",
    subjectId: "sub_bcs_math",
    question: "যদি a + b = 7 এবং ab = 10 হয়, তবে a² + b² এর মান কত?",
    options: [
      { id: "a", text: "29" },
      { id: "b", text: "39" },
      { id: "c", text: "49" },
      { id: "d", text: "19" },
    ],
    correctOptionId: "a",
    explanation: "আমরা জানি, a² + b² = (a+b)² - 2ab = (7)² - 2(10) = 49 - 20 = 29",
    difficulty: "medium",
    status: "published",
    adminVerified: true,
    tags: ["45th-bcs", "math"],
    createdBy: "system",
    updatedBy: "system",
    createdAt: null as any,
    updatedAt: null as any,
  },
  {
    id: "dc_fb_bd_1",
    examId: "exam_bcs",
    subjectId: "sub_bcs_bd_affairs",
    question: "ঐতিহাসিক ৭ই মার্চের ভাষণ সংবিধানের কোন তফসিলে অন্তর্ভুক্ত করা হয়েছে?",
    options: [
      { id: "a", text: "পঞ্চম তফসিলে" },
      { id: "b", text: "ষষ্ঠ তফসিলে" },
      { id: "c", text: "সপ্তম তফসিলে" },
      { id: "d", text: "চতুর্থ তফসিলে" },
    ],
    correctOptionId: "a",
    explanation: "বঙ্গবন্ধুর ঐতিহাসিক ৭ই মার্চের ভাষণ সংবিধানের ৫ম তফসিলে অন্তর্ভুক্ত।",
    difficulty: "medium",
    status: "published",
    adminVerified: true,
    tags: ["46th-bcs", "bangladesh"],
    createdBy: "system",
    updatedBy: "system",
    createdAt: null as any,
    updatedAt: null as any,
  },
  {
    id: "dc_fb_gn_1",
    examId: "exam_bcs",
    subjectId: "sub_bcs_intl_affairs",
    question: "আন্তর্জাতিক আদালতের (ICJ) প্রধান কার্যালয় কোথায় অবস্থিত?",
    options: [
      { id: "a", text: "হেগ, নেদারল্যান্ডস" },
      { id: "b", text: "জেনেভা, সুইজারল্যান্ড" },
      { id: "c", text: "নিউইয়র্ক, যুক্তরাষ্ট্র" },
      { id: "d", text: "ভিয়েনা, অস্ট্রিয়া" },
    ],
    correctOptionId: "a",
    explanation: "জাতিসংঘের প্রধান বিচারিক অঙ্গ আন্তর্জাতিক বিচার আদালত (ICJ) নেদারল্যান্ডসের দ্য হেগ শহরে অবস্থিত।",
    difficulty: "medium",
    status: "published",
    adminVerified: true,
    tags: ["46th-bcs", "international"],
    createdBy: "system",
    updatedBy: "system",
    createdAt: null as any,
    updatedAt: null as any,
  },
];

/**
 * Fetches or automatically generates today's 5-question Daily Challenge.
 */
export async function getTodayDailyChallenge(dateStr: string = getFormattedDate()): Promise<{
  challenge: DailyChallenge;
  questions: Question[];
}> {
  const challengeRef = dailyChallengeDoc(dateStr);

  try {
    const snap = await getDoc(challengeRef);

    if (snap.exists()) {
      const challenge = snap.data() as DailyChallenge;
      const questions = await getQuestionsByIds(challenge.questionIds);
      // Check subject diversity: must have at least 4 unique subjects
      const uniqueSubjects = new Set(questions.map((q) => q.subjectId));
      if (uniqueSubjects.size >= 4 && questions.length === 5) {
        return { challenge, questions };
      }
    }

    // Generate balanced, diverse 5-subject question set
    const selectedQuestions = await generateDiverseDailyQuestions(dateStr);
    const questionIds = selectedQuestions.map((q) => q.id);

    const newChallenge: DailyChallenge = {
      date: dateStr,
      title: `Daily Challenge — ${dateStr}`,
      questionIds,
      totalQuestions: questionIds.length,
      createdAt: serverTimestamp(),
    };

    // Attempt to persist to Firestore. In guest mode or if permissions fail, return the challenge anyway
    try {
      await setDoc(challengeRef, newChallenge);
    } catch (writeErr) {
      console.warn("Could not save dailyChallenge to Firestore (e.g. guest or offline):", writeErr);
    }

    return { challenge: newChallenge, questions: selectedQuestions };
  } catch (error) {
    console.error("Error fetching/creating today's daily challenge:", error);
    // If reading failed, generate in-memory fallback so user or guest is NEVER blocked!
    const questions = await generateDiverseDailyQuestions(dateStr);
    return {
      challenge: {
        date: dateStr,
        title: `Daily Challenge — ${dateStr}`,
        questionIds: questions.map((q) => q.id),
        totalQuestions: questions.length,
        createdAt: null,
      },
      questions,
    };
  }
}

/**
 * Checks if the user has already completed today's daily challenge.
 */
export async function hasUserCompletedDailyToday(
  userId: string,
  date: string = getFormattedDate()
): Promise<boolean> {
  if (!userId) return false;
  try {
    const q = query(
      attemptsCol(),
      where("userId", "==", userId),
      where("mode", "==", "daily"),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.some((d) => {
      const att = d.data() as Attempt;
      return att.mockTestId === `daily_${date}` || (att as any).dailyDate === date;
    });
  } catch (error) {
    console.error("Error checking user daily attempt:", error);
    return false;
  }
}
