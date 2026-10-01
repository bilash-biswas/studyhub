export type LiveRoomStatus = "waiting" | "in_progress" | "showing_result" | "finished";

export interface LivePlayerAnswer {
  questionIndex: number;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface LivePlayer {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  score: number;
  currentAnswer?: LivePlayerAnswer;
  joinedAt: any;
}

export interface LiveRoom {
  id: string; // e.g. document ID or room code
  code: string; // e.g. "BCS-8F2A"
  hostId: string;
  hostName: string;
  examId: string;
  subjectId?: string;
  questionIds: string[];
  currentQuestionIndex: number;
  status: LiveRoomStatus;
  timePerQuestion: number; // in seconds, e.g. 20 or 30
  questionStartedAt?: any;
  playerCount: number;
  maxPlayers: number; // default 20 to protect free-tier
  createdAt: any;
  updatedAt: any;
}
