import {
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { notificationsCol, notificationDoc } from "@/lib/firebase/firestore";
import {
  AppNotification,
  NotificationCategory,
  StreakTargetSegment,
} from "@/types";

export interface StreakSegmentMeta {
  id: StreakTargetSegment;
  labelBn: string;
  labelEn: string;
  badgeText: string;
  descriptionBn: string;
}

export const STREAK_SEGMENTS: StreakSegmentMeta[] = [
  {
    id: "all",
    labelBn: "সকল শিক্ষার্থী (All Streaks)",
    labelEn: "All Streak Levels (0+ Days)",
    badgeText: "সকল স্ট্রিক (All)",
    descriptionBn: "সকল রেজিস্টার্ড শিক্ষার্থীর কাছে নোটিফিকেশন যাবে",
  },
  {
    id: "streak_zero",
    labelBn: "স্ট্রিকহীন / নিষ্ক্রিয় (০ দিন স্ট্রিক)",
    labelEn: "0 Days Streak (Inactive / Comeback)",
    badgeText: "০ দিন স্ট্রিক (Comeback)",
    descriptionBn: "যাদের স্ট্রিক ০ বা ভেঙে গেছে তাদের পুনরায় অনুশীলনে ফেরাতে",
  },
  {
    id: "streak_beginner",
    labelBn: "নতুন স্ট্রিক (১–৩ দিন)",
    labelEn: "1–3 Days Streak (Beginner)",
    badgeText: "১–৩ দিন স্ট্রিক",
    descriptionBn: "যারা সবেমাত্র ধারাবাহিক অনুশীলন শুরু করেছে",
  },
  {
    id: "streak_rising",
    labelBn: "নিয়মিত অনুশীলনকারী (৪–৬ দিন)",
    labelEn: "4–6 Days Streak (Rising)",
    badgeText: "৪–৬ দিন স্ট্রিক",
    descriptionBn: "যারা ৭ দিনের সাপ্তাহিক মাইলফলকের খুব কাছাকাছি",
  },
  {
    id: "streak_champion",
    labelBn: "স্ট্রিক চ্যাম্পিয়ন (৭+ দিন)",
    labelEn: "7+ Days Streak (Weekly Champion)",
    badgeText: "৭+ দিন চ্যাম্পিয়ন",
    descriptionBn: "টানা ১ সপ্তাহ বা তার বেশি অনুশীলনকারী শিক্ষার্থী",
  },
  {
    id: "streak_legend",
    labelBn: "স্ট্রিক লিজেন্ড (৩০+ দিন)",
    labelEn: "30+ Days Streak (Monthly Legend)",
    badgeText: "৩০+ দিন লিজেন্ড",
    descriptionBn: "টানা ১ মাস বা তার বেশি অনুশীলনকারী শীর্ষ শিক্ষার্থী",
  },
  {
    id: "custom",
    labelBn: "কাস্টম স্ট্রিক রেঞ্জ (Min – Max)",
    labelEn: "Custom Streak Range (Min – Max)",
    badgeText: "কাস্টম স্ট্রিক",
    descriptionBn: "নির্দিষ্ট সর্বনিম্ন ও সর্বোচ্চ স্ট্রিক সংখ্যার শিক্ষার্থীদের জন্য",
  },
];

/**
 * Checks whether a notification's streak target matches a given user's current streak.
 */
export function matchesStreakTarget(
  notif: Partial<AppNotification>,
  userStreak: number = 0
): boolean {
  const segment = notif.targetStreakSegment || "all";
  const s = Math.max(0, Number(userStreak) || 0);

  switch (segment) {
    case "all":
      return true;
    case "streak_zero":
      return s === 0;
    case "streak_beginner":
      return s >= 1 && s <= 3;
    case "streak_rising":
      return s >= 4 && s <= 6;
    case "streak_champion":
      return s >= 7;
    case "streak_legend":
      return s >= 30;
    case "custom": {
      const min = typeof notif.minStreak === "number" ? notif.minStreak : 0;
      const max =
        typeof notif.maxStreak === "number" && notif.maxStreak >= min
          ? notif.maxStreak
          : 99999;
      return s >= min && s <= max;
    }
    default:
      return true;
  }
}

export function formatStreakTargetBadge(notif: Partial<AppNotification>): string {
  const segment = notif.targetStreakSegment || "all";
  if (segment === "custom") {
    const min = notif.minStreak ?? 0;
    const max = notif.maxStreak ?? "∞";
    return `স্ট্রিক: ${min}–${max} দিন`;
  }
  const found = STREAK_SEGMENTS.find((item) => item.id === segment);
  return found ? found.badgeText : "সকল স্ট্রিক";
}

/**
 * Admin: Creates and dispatches a new push notification in Firestore
 */
export async function sendPushNotification(data: {
  title: string;
  body: string;
  category: NotificationCategory;
  targetExamId?: string;
  targetStreakSegment?: StreakTargetSegment;
  minStreak?: number | null;
  maxStreak?: number | null;
  actionUrl?: string;
  isPinned?: boolean;
  priority?: "normal" | "high";
  createdBy: string;
}): Promise<string> {
  const now = serverTimestamp();
  const docRef = await addDoc(notificationsCol(), {
    title: data.title.trim(),
    body: data.body.trim(),
    category: data.category || "announcement",
    targetExamId: data.targetExamId || "all",
    targetStreakSegment: data.targetStreakSegment || "all",
    minStreak:
      data.targetStreakSegment === "custom" ? (data.minStreak ?? 0) : null,
    maxStreak:
      data.targetStreakSegment === "custom" ? (data.maxStreak ?? 999) : null,
    actionUrl: data.actionUrl || "/dashboard",
    isPinned: Boolean(data.isPinned),
    priority: data.priority || "high",
    createdBy: data.createdBy || "admin",
    createdAt: now,
    sentAt: Date.now(),
  });
  return docRef.id;
}

/**
 * Fetches notification history (ordered by createdAt desc)
 */
export async function getNotifications(
  limitCount: number = 30
): Promise<AppNotification[]> {
  try {
    const q = query(
      notificationsCol(),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as AppNotification[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

/**
 * Admin: Pin or unpin a notification to the Student Dashboard banner
 */
export async function toggleNotificationPin(
  id: string,
  isPinned: boolean
): Promise<void> {
  await updateDoc(notificationDoc(id), {
    isPinned,
  });
}

/**
 * Admin: Resend / re-broadcast an existing notification so clients trigger a fresh push alert
 */
export async function resendNotification(id: string): Promise<void> {
  await updateDoc(notificationDoc(id), {
    createdAt: serverTimestamp(),
    sentAt: Date.now(),
  });
}

/**
 * Admin: Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(notificationDoc(id));
}

const READ_NOTIFS_KEY = "medhavi_read_notifications";
const PUSHED_NOTIFS_KEY = "medhavi_pushed_notifications";

export function getReadNotificationIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationsRead(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const existing = new Set(getReadNotificationIds());
    ids.forEach((id) => existing.add(id));
    localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(Array.from(existing)));
  } catch {
    // ignore storage errors
  }
}

function getPushedSignatures(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PUSHED_NOTIFS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markPushedSignature(sig: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getPushedSignatures();
    existing.add(sig);
    const arr = Array.from(existing).slice(-100);
    localStorage.setItem(PUSHED_NOTIFS_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

/**
 * Real-time subscription to notifications matching the student's current streak.
 * Fires `onNewPush(notif)` whenever a brand-new or re-sent notification arrives.
 */
export function subscribeToNotifications(
  userStreak: number,
  onUpdate: (notifications: AppNotification[]) => void,
  onNewPush?: (notification: AppNotification) => void,
  limitCount: number = 25
): Unsubscribe {
  const q = query(
    notificationsCol(),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  let isFirstSnapshot = true;

  return onSnapshot(
    q,
    (snapshot) => {
      const allDocs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AppNotification[];

      const matching = allDocs.filter((n) => matchesStreakTarget(n, userStreak));
      onUpdate(matching);

      const pushedSigs = getPushedSignatures();

      if (isFirstSnapshot) {
        // Seed existing signatures on initial load so we only push new/resent ones
        matching.forEach((n) => {
          const sig = `${n.id}_${n.sentAt || ""}`;
          markPushedSignature(sig);
        });
        isFirstSnapshot = false;
        return;
      }

      for (const n of matching) {
        const sig = `${n.id}_${n.sentAt || ""}`;
        if (!pushedSigs.has(sig)) {
          markPushedSignature(sig);
          onNewPush?.(n);
          break;
        }
      }
    },
    (error) => {
      console.error("Notification subscription error:", error);
    }
  );
}
