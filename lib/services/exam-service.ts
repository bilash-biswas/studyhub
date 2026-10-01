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
import { examsCol, examDoc } from "@/lib/firebase/firestore";
import { Exam } from "@/types";

/**
 * Fetches all exams ordered by display order.
 * By default, returns only active exams for students.
 */
export async function getExams(includeInactive: boolean = false): Promise<Exam[]> {
  try {
    let q = query(examsCol(), orderBy("order", "asc"));
    if (!includeInactive) {
      q = query(examsCol(), where("isActive", "==", true), orderBy("order", "asc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Exam[];
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
}

/**
 * Fetches a single exam by slug (e.g. "bcs", "bank-job", "hsc")
 */
export async function getExamBySlug(slug: string): Promise<Exam | null> {
  try {
    const q = query(examsCol(), where("slug", "==", slug.toLowerCase().trim()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Exam;
  } catch (error) {
    console.error(`Error fetching exam by slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetches a single exam by ID
 */
export async function getExamById(id: string): Promise<Exam | null> {
  try {
    const snapshot = await getDoc(examDoc(id));
    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Exam;
  } catch (error) {
    console.error(`Error fetching exam by ID ${id}:`, error);
    return null;
  }
}

/**
 * Admin: Creates a new exam category
 */
export async function createExam(
  data: Omit<Exam, "id" | "createdAt" | "updatedAt">,
  customId?: string
): Promise<string> {
  const timestamp = serverTimestamp();
  const payload = {
    ...data,
    slug: data.slug.toLowerCase().trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (customId) {
    await setDoc(examDoc(customId), payload);
    return customId;
  }

  const docRef = await addDoc(examsCol(), payload);
  return docRef.id;
}

/**
 * Admin: Updates an existing exam
 */
export async function updateExam(
  id: string,
  data: Partial<Omit<Exam, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(examDoc(id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Deletes an exam
 */
export async function deleteExam(id: string): Promise<void> {
  await deleteDoc(examDoc(id));
}
