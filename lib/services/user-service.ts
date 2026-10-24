import {
  getDocs,
  updateDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, usersCol, userDoc } from "@/lib/firebase/firestore";
import { evaluateActiveStreak } from "@/lib/calculations/streak";
import { UserProfile, UserRole } from "@/types";

/**
 * Fetches users for administration and automatically resets any expired streaks
 * (where a user missed 1+ full calendar days: diffDays >= 2) to 0 in Firestore.
 */
export async function getUsers(maxCount: number = 50): Promise<UserProfile[]> {
  try {
    const q = query(usersCol(), orderBy("createdAt", "desc"), limit(maxCount));
    const snapshot = await getDocs(q);

    const expiredUids: string[] = [];
    const profiles: UserProfile[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as any;
      const streakEval = evaluateActiveStreak({
        currentStreak: data.currentStreak ?? data.streak ?? 0,
        lastPracticeDate: data.lastPracticeDate,
      });

      if (streakEval.isExpired) {
        expiredUids.push(docSnap.id);
      }

      return {
        uid: docSnap.id,
        ...data,
        currentStreak: streakEval.effectiveStreak,
      } as UserProfile;
    });

    // Persist expired streak resets (currentStreak -> 0) to Firestore in background
    if (expiredUids.length > 0) {
      try {
        const batch = writeBatch(db);
        for (const uid of expiredUids.slice(0, 450)) {
          batch.update(userDoc(uid), {
            currentStreak: 0,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      } catch (syncErr) {
        console.warn("Could not batch-sync expired user streaks:", syncErr);
      }
    }

    return profiles;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Admin: Updates user role (user <-> admin)
 */
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(userDoc(uid), {
    role,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Toggles active status of a user
 */
export async function toggleUserActive(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(userDoc(uid), {
    isActive,
    updatedAt: serverTimestamp(),
  });
}
