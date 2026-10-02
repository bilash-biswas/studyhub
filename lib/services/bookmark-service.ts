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
  questionId: string
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
