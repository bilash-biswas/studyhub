import {
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  addDoc,
  DocumentSnapshot,
  QueryConstraint,
  documentId,
} from "firebase/firestore";
import { questionsCol, questionDoc } from "@/lib/firebase/firestore";
import { Question, QuestionDifficulty, QuestionStatus } from "@/types";

export interface QuestionFilters {
  examId?: string;
  subjectId?: string;
  difficulty?: QuestionDifficulty;
  status?: QuestionStatus;
  tag?: string;
}

export interface PaginatedQuestionsResult {
  questions: Question[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Fetches questions with cursor-based pagination and flexible filters.
 * Restricts queries to small batch sizes (default 20) to strictly protect Firebase Spark free tier.
 */
export async function getQuestions(
  filters: QuestionFilters = {},
  pageSize: number = 20,
  lastDocSnap: DocumentSnapshot | null = null
): Promise<PaginatedQuestionsResult> {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters.examId) {
      constraints.push(where("examId", "==", filters.examId));
    }
    if (filters.subjectId) {
      constraints.push(where("subjectId", "==", filters.subjectId));
    }
    if (filters.difficulty) {
      constraints.push(where("difficulty", "==", filters.difficulty));
    }
    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    } else {
      // By default, query published if no status specified
      constraints.push(where("status", "==", "published"));
    }

    if (filters.tag) {
      constraints.push(where("tags", "array-contains", filters.tag.toLowerCase().trim()));
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (lastDocSnap) {
      constraints.push(startAfter(lastDocSnap));
    }

    constraints.push(limit(pageSize + 1));

    const q = query(questionsCol(), ...constraints);
    const snapshot = await getDocs(q);

    const hasMore = snapshot.docs.length > pageSize;
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
    const lastDoc = docs.length > 0 ? docs[docs.length - 1] : null;

    const questions = docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Question[];

    return {
      questions,
      lastDoc,
      hasMore,
    };
  } catch (error: any) {
    // If a composite index is missing or building, fall back to simple filtering and in-memory sort
    if (error?.message?.includes("requires an index") || error?.code === "failed-precondition") {
      try {
        const fallbackConstraints: QueryConstraint[] = [];
        if (filters.examId) fallbackConstraints.push(where("examId", "==", filters.examId));
        if (filters.subjectId) fallbackConstraints.push(where("subjectId", "==", filters.subjectId));
        if (filters.difficulty) fallbackConstraints.push(where("difficulty", "==", filters.difficulty));
        if (filters.status) {
          fallbackConstraints.push(where("status", "==", filters.status));
        } else {
          fallbackConstraints.push(where("status", "==", "published"));
        }
        if (filters.tag) {
          fallbackConstraints.push(where("tags", "array-contains", filters.tag.toLowerCase().trim()));
        }
        fallbackConstraints.push(limit(pageSize * 3));

        const fallbackQ = query(questionsCol(), ...fallbackConstraints);
        const snapshot = await getDocs(fallbackQ);

        const allDocs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Question[];

        allDocs.sort((a: any, b: any) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });

        const hasMore = allDocs.length > pageSize;
        const questions = allDocs.slice(0, pageSize);
        const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] : null;

        return {
          questions,
          lastDoc,
          hasMore,
        };
      } catch (fallbackError) {
        console.error("Fallback error fetching questions:", fallbackError);
      }
    }

    console.error("Error fetching questions:", error);
    return {
      questions: [],
      lastDoc: null,
      hasMore: false,
    };
  }
}

/**
 * Fetches a single question by ID
 */
export async function getQuestionById(id: string): Promise<Question | null> {
  try {
    const snapshot = await getDoc(questionDoc(id));
    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Question;
  } catch (error) {
    console.error(`Error fetching question ${id}:`, error);
    return null;
  }
}

/**
 * Fetches multiple questions by their IDs efficiently using chunked Firestore 'in' queries.
 */
export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (!ids || ids.length === 0) return [];
  const results: Question[] = [];
  const uniqueIds = Array.from(new Set(ids));

  try {
    for (let i = 0; i < uniqueIds.length; i += 30) {
      const chunk = uniqueIds.slice(i, i + 30);
      const q = query(questionsCol(), where(documentId(), "in", chunk));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        results.push({ id: d.id, ...d.data() } as Question);
      });
    }
    return results;
  } catch (error) {
    console.error("Error fetching questions by IDs:", error);
    return [];
  }
}

/**
 * Admin: Creates a new question in the Question Bank
 */
export async function createQuestion(
  data: Omit<Question, "id" | "createdAt" | "updatedAt">,
  customId?: string
): Promise<string> {
  const timestamp = serverTimestamp();
  const payload = {
    ...data,
    tags: data.tags.map((t) => t.toLowerCase().trim()),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (customId) {
    await setDoc(questionDoc(customId), payload);
    return customId;
  }

  const docRef = await addDoc(questionsCol(), payload);
  return docRef.id;
}

/**
 * Admin: Updates an existing question
 */
export async function updateQuestion(
  id: string,
  data: Partial<Omit<Question, "id" | "createdAt">>
): Promise<void> {
  const payload: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.tags) {
    payload.tags = data.tags.map((t) => t.toLowerCase().trim());
  }

  await updateDoc(questionDoc(id), payload);
}

/**
 * Admin: Deletes a question
 */
export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(questionDoc(id));
}

/**
 * Admin: Updates question publishing status
 */
export async function updateQuestionStatus(
  id: string,
  status: QuestionStatus,
  adminUserId: string
): Promise<void> {
  await updateDoc(questionDoc(id), {
    status,
    updatedBy: adminUserId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Seeds sample questions across BCS, Bank, and Govt Job Recruitment with KaTeX math and Bengali content
 */
export const SAMPLE_QUESTIONS: Omit<Question, "createdAt" | "updatedAt">[] = [
  // 1. BCS ICT - Subnetting with math notation
  {
    id: "q_bcs_ict_01",
    examId: "exam_bcs",
    subjectId: "sub_bcs_ict",
    question: "What is the broadcast address of the subnet `192.168.1.0/28`?",
    options: [
      { id: "a", text: "192.168.1.0" },
      { id: "b", text: "192.168.1.1" },
      { id: "c", text: "192.168.1.15" },
      { id: "d", text: "192.168.1.16" },
    ],
    correctOptionId: "c",
    explanation:
      "A `/28` subnet mask has 4 host bits ($32 - 28 = 4$). The block size is $2^4 = 16$ addresses ($192.168.1.0$ to $192.168.1.15$). The first address ($192.168.1.0$) is the network address and the last address ($192.168.1.15$) is the broadcast address.",
    difficulty: "medium",
    year: 2024,
    source: "45th BCS Preliminary",
    tags: ["networking", "subnetting", "ipv4", "bcs-ict"],
    status: "published",
    createdBy: "system",
    updatedBy: "system",
  },
  // 2. BCS Math - Algebraic Equation with KaTeX
  {
    id: "q_bcs_math_01",
    examId: "exam_bcs",
    subjectId: "sub_bcs_math",
    question: "যদি $x + \\frac{1}{x} = 3$ হয়, তবে $x^3 + \\frac{1}{x^3}$ এর মান কত?",
    options: [
      { id: "a", text: "$18$" },
      { id: "b", text: "$27$" },
      { id: "c", text: "$36$" },
      { id: "d", text: "$9$" },
    ],
    correctOptionId: "a",
    explanation:
      "আমরা জানি, $a^3 + b^3 = (a+b)^3 - 3ab(a+b)$। সুতরাং, $x^3 + \\frac{1}{x^3} = (x + \\frac{1}{x})^3 - 3(x)(\\frac{1}{x})(x + \\frac{1}{x}) = 3^3 - 3(3) = 27 - 9 = 18$।",
    difficulty: "medium",
    year: 2023,
    source: "44th BCS Preliminary",
    tags: ["algebra", "equations", "math-shortcut", "bcs-math"],
    status: "published",
    createdBy: "system",
    updatedBy: "system",
  },
  // 3. Bank Job - Quantitative Aptitude Percentage
  {
    id: "q_bank_math_01",
    examId: "exam_bank_job",
    subjectId: "sub_bank_math",
    question: "If the price of sugar is increased by $25\\%$, by what percentage must consumption be reduced so as not to increase the expenditure?",
    options: [
      { id: "a", text: "$20\\%$" },
      { id: "b", text: "$25\\%$" },
      { id: "c", text: "$16.67\\%$" },
      { id: "d", text: "$15\\%$" },
    ],
    correctOptionId: "a",
    explanation:
      "Reduction in consumption percentage $= \\left( \\frac{R}{100 + R} \\right) \\times 100\\% = \\left( \\frac{25}{100 + 25} \\right) \\times 100\\% = \\frac{25}{125} \\times 100\\% = 20\\%$।",
    difficulty: "easy",
    year: 2023,
    source: "Combined 8 Banks Officer 2023",
    tags: ["arithmetic", "percentage", "bank-math"],
    status: "published",
    createdBy: "system",
    updatedBy: "system",
  },
  // 4. BCS Bangla - Literature
  {
    id: "q_bcs_bangla_01",
    examId: "exam_bcs",
    subjectId: "sub_bcs_bangla",
    question: "'চর্যাপদ' কত সালে এবং কোথা থেকে আবিষ্কৃত হয়?",
    options: [
      { id: "a", text: "১৯০৭ সালে, নেপালের রাজদরবারের রয়েল লাইব্রেরি থেকে" },
      { id: "b", text: "১৯১৬ সালে, বঙ্গীয় সাহিত্য পরিষদ থেকে" },
      { id: "c", text: "১৯২০ সালে, ঢাকা বিশ্ববিদ্যালয় থেকে" },
      { id: "d", text: "১৮০৭ সালে, তিব্বত থেকে" },
    ],
    correctOptionId: "a",
    explanation:
      "মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপালের রাজদরবারের রয়েল লাইব্রেরি ('রয়েল লাইব্রেরি অব নেপাল') থেকে চর্যাপদের পুঁথি আবিষ্কার করেন। পরবর্তীতে ১৯১৬ সালে বঙ্গীয় সাহিত্য পরিষদ থেকে এটি 'হাজার বছরের পুরাণ বাঙ্গালা ভাষায় রচিত বৌদ্ধগান ও দোহা' নামে প্রকাশিত হয়।",
    difficulty: "easy",
    year: 2022,
    source: "43rd BCS Preliminary",
    tags: ["charyapada", "ancient-literature", "bcs-bangla"],
    status: "published",
    createdBy: "system",
    updatedBy: "system",
  },
  // 5. Govt Jobs / Primary ICT - Number System
  {
    id: "q_govt_ict_01",
    examId: "exam_govt_jobs",
    subjectId: "sub_govt_science_ict",
    question: "$(1101)_2$ বাইনারি সংখ্যার সমতুল্য দশমিক (Decimal) মান কত?",
    options: [
      { id: "a", text: "$11$" },
      { id: "b", text: "$12$" },
      { id: "c", text: "$13$" },
      { id: "d", text: "$14$" },
    ],
    correctOptionId: "c",
    explanation:
      "$(1101)_2 = 1 \\times 2^3 + 1 \\times 2^2 + 0 \\times 2^1 + 1 \\times 2^0 = 8 + 4 + 0 + 1 = 13$।",
    difficulty: "easy",
    year: 2023,
    source: "Primary Assistant Teacher Recruitment 2023",
    tags: ["number-system", "binary", "govt-ict"],
    status: "published",
    createdBy: "system",
    updatedBy: "system",
  },
];

/**
 * Idempotently seeds initial sample questions if question collection is empty
 */
export async function seedSampleQuestions(adminUserId: string = "system"): Promise<number> {
  try {
    const checkSnapshot = await getDocs(query(questionsCol(), limit(1)));
    if (!checkSnapshot.empty) {
      return 0;
    }

    let count = 0;
    for (const q of SAMPLE_QUESTIONS) {
      await createQuestion(
        {
          ...q,
          createdBy: adminUserId,
          updatedBy: adminUserId,
        },
        q.id
      );
      count++;
    }
    return count;
  } catch (error) {
    console.error("Error seeding sample questions:", error);
    return 0;
  }
}
