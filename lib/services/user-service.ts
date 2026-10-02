import {
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { usersCol, userDoc } from "@/lib/firebase/firestore";
import { UserProfile, UserRole } from "@/types";

/**
 * Fetches recent users for administration
 */
export async function getUsers(maxCount: number = 50): Promise<UserProfile[]> {
  try {
    const q = query(usersCol(), orderBy("createdAt", "desc"), limit(maxCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    })) as UserProfile[];
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
