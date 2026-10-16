import {
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { userBookmarkDoc, userBookmarksCol } from "@/lib/firebase/firestore";

/**
 * Toggles a bookmark for a specific user and question.
 * Returns true if bookmarked, false if removed.
 */
export async function toggleBookmark(
  userId: string,
  questionId: string,
  metadata?: { selectedOptionId?: string | null }
): Promise<boolean> {
  try {
    const docRef = userBookmarkDoc(userId, questionId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await deleteDoc(docRef);
      return false;
    } else {
      await setDoc(docRef, {
        questionId,
        selectedOptionId: metadata?.selectedOptionId || null,
        addedAt: serverTimestamp(),
      });
      return true;
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
}

/**
 * Saves or updates user's selected answer on a bookmarked question
 */
export async function saveBookmarkAnswer(
  userId: string,
  questionId: string,
  selectedOptionId: string
): Promise<void> {
  try {
    const docRef = userBookmarkDoc(userId, questionId);
    await setDoc(
      docRef,
      {
        questionId,
        selectedOptionId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving bookmark answer:", error);
  }
}

/**
 * Checks if a question is bookmarked by a user
 */
export async function isQuestionBookmarked(
  userId: string,
  questionId: string
): Promise<boolean> {
  try {
    const snap = await getDoc(userBookmarkDoc(userId, questionId));
    return snap.exists();
  } catch (error) {
    console.error("Error checking bookmark:", error);
    return false;
  }
}

/**
 * Gets all bookmarked question IDs for a user
 */
export async function getUserBookmarkIds(userId: string): Promise<string[]> {
  try {
    const snapshot = await getDocs(userBookmarksCol(userId));
    return snapshot.docs.map((d) => d.id);
  } catch (error) {
    console.error("Error fetching user bookmarks:", error);
    return [];
  }
}

/**
 * Gets map of questionId -> bookmark metadata (including selectedOptionId)
 */
export async function getUserBookmarksMap(
  userId: string
): Promise<Record<string, { selectedOptionId?: string | null }>> {
  try {
    const snapshot = await getDocs(userBookmarksCol(userId));
    const map: Record<string, { selectedOptionId?: string | null }> = {};
    snapshot.docs.forEach((d) => {
      map[d.id] = {
        selectedOptionId: d.data().selectedOptionId || null,
      };
    });
    return map;
  } catch (error) {
    console.error("Error fetching bookmarks map:", error);
    return {};
  }
}

