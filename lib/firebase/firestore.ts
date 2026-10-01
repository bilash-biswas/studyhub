import { getFirestore, Firestore, collection, doc } from "firebase/firestore";
import { app } from "./config";

export const db: Firestore = getFirestore(app);

// Collection path constants
export const COLLECTIONS = {
  USERS: "users",
  EXAMS: "exams",
  SUBJECTS: "subjects",
  QUESTIONS: "questions",
  MOCK_TESTS: "mockTests",
  ATTEMPTS: "attempts",
  DAILY_CHALLENGES: "dailyChallenges",
  LEADERBOARD_SCORES: "leaderboardScores",
  LIVE_ROOMS: "liveRooms",
} as const;

// Typed Firestore document helpers
export const usersCol = () => collection(db, COLLECTIONS.USERS);
export const userDoc = (uid: string) => doc(db, COLLECTIONS.USERS, uid);

export const examsCol = () => collection(db, COLLECTIONS.EXAMS);
export const examDoc = (id: string) => doc(db, COLLECTIONS.EXAMS, id);

export const subjectsCol = () => collection(db, COLLECTIONS.SUBJECTS);
export const subjectDoc = (id: string) => doc(db, COLLECTIONS.SUBJECTS, id);

export const questionsCol = () => collection(db, COLLECTIONS.QUESTIONS);
export const questionDoc = (id: string) => doc(db, COLLECTIONS.QUESTIONS, id);

export const mockTestsCol = () => collection(db, COLLECTIONS.MOCK_TESTS);
export const mockTestDoc = (id: string) => doc(db, COLLECTIONS.MOCK_TESTS, id);

export const attemptsCol = () => collection(db, COLLECTIONS.ATTEMPTS);
export const attemptDoc = (id: string) => doc(db, COLLECTIONS.ATTEMPTS, id);

export const dailyChallengesCol = () => collection(db, COLLECTIONS.DAILY_CHALLENGES);
export const dailyChallengeDoc = (date: string) => doc(db, COLLECTIONS.DAILY_CHALLENGES, date);

export const leaderboardScoresCol = () => collection(db, COLLECTIONS.LEADERBOARD_SCORES);
export const leaderboardScoreDoc = (id: string) => doc(db, COLLECTIONS.LEADERBOARD_SCORES, id);

export const liveRoomsCol = () => collection(db, COLLECTIONS.LIVE_ROOMS);
export const liveRoomDoc = (roomId: string) => doc(db, COLLECTIONS.LIVE_ROOMS, roomId);
export const liveRoomPlayersCol = (roomId: string) => collection(db, COLLECTIONS.LIVE_ROOMS, roomId, "players");
export const liveRoomPlayerDoc = (roomId: string, uid: string) => doc(db, COLLECTIONS.LIVE_ROOMS, roomId, "players", uid);

// User Subcollections
export const userBookmarksCol = (uid: string) => collection(db, COLLECTIONS.USERS, uid, "bookmarks");
export const userBookmarkDoc = (uid: string, questionId: string) => doc(db, COLLECTIONS.USERS, uid, "bookmarks", questionId);

export const userQuestionStatsCol = (uid: string) => collection(db, COLLECTIONS.USERS, uid, "questionStats");
export const userQuestionStatDoc = (uid: string, questionId: string) => doc(db, COLLECTIONS.USERS, uid, "questionStats", questionId);
