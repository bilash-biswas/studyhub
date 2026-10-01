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
import { subjectsCol, subjectDoc } from "@/lib/firebase/firestore";
import { Subject } from "@/types";

/**
 * Fetches all subjects for a given exam ordered by order.
 * By default, returns only active subjects for students.
 */
export async function getSubjectsByExamId(
  examId: string,
  includeInactive: boolean = false
): Promise<Subject[]> {
  try {
    let q = query(
      subjectsCol(),
      where("examId", "==", examId),
      orderBy("order", "asc")
    );

    if (!includeInactive) {
      q = query(
        subjectsCol(),
        where("examId", "==", examId),
        where("isActive", "==", true),
        orderBy("order", "asc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Subject[];
  } catch (error) {
    console.error(`Error fetching subjects for exam ${examId}:`, error);
    return [];
  }
}

/**
 * Fetches a single subject by ID
 */
export async function getSubjectById(id: string): Promise<Subject | null> {
  try {
    const snapshot = await getDoc(subjectDoc(id));
    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Subject;
  } catch (error) {
    console.error(`Error fetching subject by ID ${id}:`, error);
    return null;
  }
}

/**
 * Admin: Creates a new subject
 */
export async function createSubject(
  data: Omit<Subject, "id" | "createdAt" | "updatedAt">,
  customId?: string
): Promise<string> {
  const timestamp = serverTimestamp();
  const payload = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (customId) {
    await setDoc(subjectDoc(customId), payload);
    return customId;
  }

  const docRef = await addDoc(subjectsCol(), payload);
  return docRef.id;
}

/**
 * Admin: Updates an existing subject
 */
export async function updateSubject(
  id: string,
  data: Partial<Omit<Subject, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(subjectDoc(id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Deletes a subject
 */
export async function deleteSubject(id: string): Promise<void> {
  await deleteDoc(subjectDoc(id));
}
