import {
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { mockTestsCol, mockTestDoc } from "@/lib/firebase/firestore";
import { MockTest } from "@/types";

/**
 * Fetches all published mock tests, optionally filtered by exam.
 */
export async function getMockTests(examId?: string): Promise<MockTest[]> {
  try {
    let q = query(
      mockTestsCol(),
      where("isPublished", "==", true)
    );

    if (examId) {
      q = query(
        mockTestsCol(),
        where("isPublished", "==", true),
        where("examId", "==", examId)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as MockTest[];
  } catch (error) {
    console.error("Error fetching mock tests:", error);
    return [];
  }
}

/**
 * Fetches a single mock test by ID.
 */
export async function getMockTestById(id: string): Promise<MockTest | null> {
  try {
    const snap = await getDoc(mockTestDoc(id));
    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data(),
    } as MockTest;
  } catch (error) {
    console.error(`Error fetching mock test ${id}:`, error);
    return null;
  }
}

/**
 * Admin: Creates a mock test
 */
export async function createMockTest(
  data: Omit<MockTest, "id" | "createdAt" | "updatedAt">,
  customId?: string
): Promise<string> {
  const timestamp = serverTimestamp();
  const payload = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (customId) {
    await setDoc(mockTestDoc(customId), payload);
    return customId;
  }

  const docRef = await addDoc(mockTestsCol(), payload);
  return docRef.id;
}

/**
 * Admin: Updates an existing mock test
 */
export async function updateMockTest(
  id: string,
  data: Partial<Omit<MockTest, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(mockTestDoc(id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Deletes a mock test
 */
export async function deleteMockTest(id: string): Promise<void> {
  await deleteDoc(mockTestDoc(id));
}

/**
 * Seeds realistic default mock tests if none exist.
 */
export async function seedSampleMockTests(availableQuestionIds: string[]): Promise<void> {
  try {
    const existing = await getMockTests();
    if (existing.length > 0) return;

    const bcsTest: Omit<MockTest, "id" | "createdAt" | "updatedAt"> = {
      examId: "exam_bcs",
      title: "46th BCS Preliminary Grand Model Test 01",
      description: "Complete full-length simulation of 46th BCS Preliminary examination. Negative marking: 0.5 per wrong answer.",
      durationMinutes: 30,
      totalQuestions: availableQuestionIds.length > 0 ? Math.min(20, availableQuestionIds.length) : 10,
      questionIds: availableQuestionIds.slice(0, 20),
      correctMark: 1.0,
      wrongMark: 0.5,
      passPercentage: 50,
      isPublished: true,
    };

    const bankTest: Omit<MockTest, "id" | "createdAt" | "updatedAt"> = {
      examId: "exam_bank",
      title: "Combined 8 Banks Officer (Cash) Model Test 01",
      description: "Recruitment model test for Senior Officer and Officer (Cash). Negative marking: 0.25 per wrong answer.",
      durationMinutes: 30,
      totalQuestions: availableQuestionIds.length > 0 ? Math.min(20, availableQuestionIds.length) : 10,
      questionIds: availableQuestionIds.slice(0, 20),
      correctMark: 1.0,
      wrongMark: 0.25,
      passPercentage: 50,
      isPublished: true,
    };

    const hscTest: Omit<MockTest, "id" | "createdAt" | "updatedAt"> = {
      examId: "exam_hsc",
      title: "HSC Board Exam Model Test (Higher Math & ICT)",
      description: "Standard model test strictly adhering to NCTB syllabus and question patterns. No negative marking.",
      durationMinutes: 25,
      totalQuestions: availableQuestionIds.length > 0 ? Math.min(15, availableQuestionIds.length) : 10,
      questionIds: availableQuestionIds.slice(0, 15),
      correctMark: 1.0,
      wrongMark: 0,
      passPercentage: 33,
      isPublished: true,
    };

    await Promise.all([
      createMockTest(bcsTest, "mock_bcs_01"),
      createMockTest(bankTest, "mock_bank_01"),
      createMockTest(hscTest, "mock_hsc_01"),
    ]);
  } catch (error) {
    console.error("Error seeding sample mock tests:", error);
  }
}
