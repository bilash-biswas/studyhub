import {
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  doc,
  Unsubscribe,
} from "firebase/firestore";
import {
  liveRoomsCol,
  liveRoomDoc,
  liveRoomPlayersCol,
  liveRoomPlayerDoc,
} from "@/lib/firebase/firestore";
import { LiveRoom, LivePlayer, LivePlayerAnswer } from "@/types";

/**
 * Generates a clean, readable 6-character room code (e.g. "BCS892")
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface CreateLiveRoomInput {
  hostId: string;
  hostName: string;
  examId: string;
  subjectId?: string;
  questionIds: string[];
  timePerQuestion?: number;
}

/**
 * Creates a new real-time quiz room with host enrolled
 */
export async function createLiveRoom(input: CreateLiveRoomInput): Promise<string> {
  const code = generateRoomCode();
  const roomRef = doc(liveRoomsCol());
  const roomId = roomRef.id;
  const timestamp = serverTimestamp();

  const roomData: Omit<LiveRoom, "id"> = {
    code,
    hostId: input.hostId,
    hostName: input.hostName,
    examId: input.examId,
    subjectId: input.subjectId,
    questionIds: input.questionIds,
    currentQuestionIndex: 0,
    status: "waiting",
    timePerQuestion: input.timePerQuestion || 20,
    playerCount: 1,
    maxPlayers: 20, // Strict free-tier quota safeguard
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await setDoc(roomRef, roomData);

  // Add host as first player in subcollection
  await setDoc(liveRoomPlayerDoc(roomId, input.hostId), {
    uid: input.hostId,
    displayName: input.hostName,
    photoURL: null,
    score: 0,
    joinedAt: timestamp,
  });

  return roomId;
}

/**
 * Finds an active room by its 6-character join code
 */
export async function findRoomByCode(code: string): Promise<LiveRoom | null> {
  const cleanCode = code.toUpperCase().trim();
  try {
    const q = query(
      liveRoomsCol(),
      where("code", "==", cleanCode),
      where("status", "in", ["waiting", "in_progress"]),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as LiveRoom;
  } catch (error) {
    console.error("Error looking up room code:", error);
    return null;
  }
}

/**
 * Joins a player into a live room
 */
export async function joinLiveRoom(
  roomId: string,
  player: { uid: string; displayName: string; photoURL?: string | null }
): Promise<void> {
  const roomSnap = await getDoc(liveRoomDoc(roomId));
  if (!roomSnap.exists()) {
    throw new Error("Room does not exist.");
  }

  const room = roomSnap.data() as LiveRoom;
  if (room.status === "finished") {
    throw new Error("This quiz room has already ended.");
  }

  // Check if player already in room
  const playerRef = liveRoomPlayerDoc(roomId, player.uid);
  const playerSnap = await getDoc(playerRef);

  if (!playerSnap.exists()) {
    if (room.playerCount >= room.maxPlayers) {
      throw new Error(`Room is full (Maximum ${room.maxPlayers} players allowed).`);
    }

    await setDoc(playerRef, {
      uid: player.uid,
      displayName: player.displayName || "Candidate",
      photoURL: player.photoURL || null,
      score: 0,
      joinedAt: serverTimestamp(),
    });

    await updateDoc(liveRoomDoc(roomId), {
      playerCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Subscribes to live room metadata updates in real-time
 */
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: LiveRoom | null) => void
): Unsubscribe {
  return onSnapshot(
    liveRoomDoc(roomId),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...docSnap.data() } as LiveRoom);
      } else {
        onUpdate(null);
      }
    },
    (err) => console.error("Room listener error:", err)
  );
}

/**
 * Subscribes to player scoreboard in real-time
 */
export function subscribeToPlayers(
  roomId: string,
  onUpdate: (players: LivePlayer[]) => void
): Unsubscribe {
  const q = query(liveRoomPlayersCol(roomId), orderBy("score", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const players = snap.docs.map((d) => ({
        ...d.data(),
      })) as LivePlayer[];
      onUpdate(players);
    },
    (err) => console.error("Players listener error:", err)
  );
}

/**
 * Host: Starts the quiz game
 */
export async function startLiveRoom(roomId: string): Promise<void> {
  await updateDoc(liveRoomDoc(roomId), {
    status: "in_progress",
    currentQuestionIndex: 0,
    questionStartedAt: Date.now(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Player: Submits an answer for the current active question
 */
export async function submitLiveAnswer(
  roomId: string,
  uid: string,
  answer: {
    questionIndex: number;
    selectedOptionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    timeSpentSeconds: number;
  }
): Promise<void> {
  const playerRef = liveRoomPlayerDoc(roomId, uid);
  await updateDoc(playerRef, {
    score: increment(answer.pointsEarned),
    currentAnswer: {
      questionIndex: answer.questionIndex,
      selectedOptionId: answer.selectedOptionId,
      isCorrect: answer.isCorrect,
      timeSpentSeconds: answer.timeSpentSeconds,
    },
  });
}

/**
 * Host: Advances to next question or concludes game
 */
export async function advanceLiveQuestion(
  roomId: string,
  nextIndex: number,
  isFinished: boolean
): Promise<void> {
  if (isFinished) {
    await updateDoc(liveRoomDoc(roomId), {
      status: "finished",
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(liveRoomDoc(roomId), {
      currentQuestionIndex: nextIndex,
      status: "in_progress",
      questionStartedAt: Date.now(),
      updatedAt: serverTimestamp(),
    });
  }
}
