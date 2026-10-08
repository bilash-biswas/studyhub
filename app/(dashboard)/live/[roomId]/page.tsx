"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LiveRoom, LivePlayer, Question } from "@/types";
import {
  subscribeToRoom,
  subscribeToPlayers,
  startLiveRoom,
  submitLiveAnswer,
  advanceLiveQuestion,
} from "@/lib/services/live-room-service";
import { getQuestionsByIds } from "@/lib/services/question-service";
import { MathText } from "@/components/ui/math-text";
import { Button } from "@/components/ui/button";
import {
  Users2,
  Timer,
  Play,
  Trophy,
  Crown,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function LiveRoomArenaPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(20);
  const [loading, setLoading] = useState(true);

  const prevQuestionIndexRef = useRef<number>(-1);

  // Subscribe to Live Room and Players
  useEffect(() => {
    if (!roomId) return;

    const unsubRoom = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      setLoading(false);
    });

    const unsubPlayers = subscribeToPlayers(roomId, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [roomId]);

  // Load questions when questionIds become available
  useEffect(() => {
    if (room && room.questionIds && room.questionIds.length > 0 && questions.length === 0) {
      getQuestionsByIds(room.questionIds)
        .then(setQuestions)
        .catch(console.error);
    }
  }, [room, questions.length]);

  // Handle question transition and synchronous countdown timer
  useEffect(() => {
    if (!room || room.status !== "in_progress") return;

    // Reset local answer state when moving to a new question index
    if (room.currentQuestionIndex !== prevQuestionIndexRef.current) {
      prevQuestionIndexRef.current = room.currentQuestionIndex;
      setSelectedOption(null);
      setHasAnsweredCurrent(false);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const started = room.questionStartedAt || now;
      const elapsed = Math.floor((now - started) / 1000);
      const remaining = Math.max(0, room.timePerQuestion - elapsed);
      setRemainingSeconds(remaining);
    }, 500);

    return () => clearInterval(interval);
  }, [room]);

  const isHost = user?.uid === room?.hostId;
  const currentQuestion =
    room && questions.length > room.currentQuestionIndex
      ? questions[room.currentQuestionIndex]
      : null;

  const handleStartGame = async () => {
    if (!isHost || !room) return;
    try {
      await startLiveRoom(room.id);
    } catch (err) {
      console.error("Failed to start room:", err);
    }
  };

  const handleSelectOption = async (optionId: string) => {
    if (hasAnsweredCurrent || !user || !currentQuestion || !room) return;

    setSelectedOption(optionId);
    setHasAnsweredCurrent(true);

    const isCorrect = optionId === currentQuestion.correctOptionId;
    // Score formula: Base 500 + up to 500 bonus for faster answers
    const speedRatio = Math.max(0.1, remainingSeconds / room.timePerQuestion);
    const pointsEarned = isCorrect ? Math.round(500 + 500 * speedRatio) : 0;
    const timeSpent = room.timePerQuestion - remainingSeconds;

    try {
      await submitLiveAnswer(room.id, user.uid, {
        questionIndex: room.currentQuestionIndex,
        selectedOptionId: optionId,
        isCorrect,
        pointsEarned,
        timeSpentSeconds: timeSpent,
      });
    } catch (err) {
      console.error("Failed to submit live answer:", err);
    }
  };

  const handleAdvance = async () => {
    if (!isHost || !room) return;
    const nextIdx = room.currentQuestionIndex + 1;
    const isFinished = nextIdx >= room.questionIds.length;
    try {
      await advanceLiveQuestion(room.id, nextIdx, isFinished);
    } catch (err) {
      console.error("Failed to advance question:", err);
    }
  };

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Connecting to live quiz server...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-3">
        <h2 className="text-base font-bold">Room Not Found</h2>
        <p className="text-xs text-slate-500">This live quiz room is inactive or has been closed.</p>
        <Button onClick={() => router.push("/live")} size="sm" className="text-xs">
          Return to Lobby
        </Button>
      </div>
    );
  }

  // 1. WAITING ROOM VIEW
  if (room.status === "waiting") {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-20">
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs text-center space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Live Quiz Lobby
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Waiting for Players
            </h1>
            <p className="text-xs text-slate-500">
              Share the room code with your friends or classmates to join.
            </p>
          </div>

          {/* Large Code Badge with Copy */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 inline-flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Room Code</span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#4F46E5] dark:text-[#818CF8] tracking-widest">
              {room.code}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium pt-1"
            >
              {copiedCode ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Connected Players Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold px-1">
              <span>Connected Candidates</span>
              <span>
                {players.length} / {room.maxPlayers}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {players.map((p) => (
                <div
                  key={p.uid}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg flex items-center gap-2 text-left"
                >
                  <div className="h-7 w-7 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {p.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {p.displayName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="pt-2">
            {isHost ? (
              <Button
                onClick={handleStartGame}
                disabled={players.length === 0}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs h-10 gap-1.5 font-bold shadow-xs"
              >
                <Play className="h-4 w-4" />
                Start Live Quiz Now ({players.length} Players)
              </Button>
            ) : (
              <div className="text-xs text-slate-500 flex items-center justify-center gap-2 py-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span>Waiting for the host ({room.hostName}) to start the game...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. FINISHED ROOM VIEW (PODIUM)
  if (room.status === "finished") {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="max-w-xl mx-auto space-y-6 pb-20">
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs text-center space-y-6">
          <div className="space-y-1">
            <div className="h-14 w-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <Trophy className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Live Quiz Finished!
            </h1>
            <p className="text-xs text-slate-500">
              Final scoreboard and standings.
            </p>
          </div>

          {winner && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 inline-flex flex-col items-center gap-1.5">
              <Crown className="h-6 w-6 text-amber-500" />
              <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                Champion: {winner.displayName}
              </div>
              <div className="text-xl font-extrabold text-amber-600">
                {winner.score} Points
              </div>
            </div>
          )}

          {/* Standings List */}
          <div className="space-y-2 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Final Standings
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
              {sortedPlayers.map((p, idx) => (
                <div
                  key={p.uid}
                  className="p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-500">#{idx + 1}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {p.displayName}
                    </span>
                  </div>
                  <span className="font-extrabold text-[#4F46E5] dark:text-[#818CF8]">
                    {p.score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => router.push("/live")}
            className="w-full text-xs"
          >
            Return to Live Lobby
          </Button>
        </div>
      </div>
    );
  }

  // 3. IN PROGRESS ARENA VIEW
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Top Arena Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] uppercase tracking-wider">
            Live Quiz Arena
          </span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Question {room.currentQuestionIndex + 1} of {room.questionIds.length}
          </div>
        </div>

        {/* Live Synchronized Timer */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wider ${
            remainingSeconds <= 5
              ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/60 dark:text-red-400 animate-pulse"
              : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          <Timer className="h-4 w-4" />
          <span>{remainingSeconds}s</span>
        </div>

        {isHost && (
          <Button
            size="sm"
            onClick={handleAdvance}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1 h-8"
          >
            <span>
              {room.currentQuestionIndex + 1 >= room.questionIds.length
                ? "Finish Quiz"
                : "Next Question"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question & Options Area (2 Cols) */}
        <div className="md:col-span-2 space-y-4">
          {currentQuestion ? (
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                <MathText text={currentQuestion.question} />
              </div>

              {currentQuestion.imageUrl && (
                <div className="relative max-w-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-h-52 object-contain mx-auto"
                  />
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === opt.id;
                  const letter = optionLetters[optIdx] || `${optIdx + 1}`;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={hasAnsweredCurrent || remainingSeconds <= 0}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "border-[#4F46E5] bg-indigo-50/70 text-slate-900 dark:bg-indigo-950/40 dark:text-slate-100 ring-2 ring-[#4F46E5]/40"
                          : hasAnsweredCurrent
                          ? "opacity-60 border-slate-200 dark:border-slate-800"
                          : "border-slate-200 hover:border-slate-300 bg-white dark:bg-[#111827] dark:border-slate-800"
                      }`}
                    >
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-[#4F46E5] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {letter}
                      </span>
                      <div className="text-sm font-normal pt-0.5 leading-snug flex-1">
                        <MathText text={opt.text} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasAnsweredCurrent && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Your answer is locked in! Awaiting round completion...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading current question...
            </div>
          )}
        </div>

        {/* Live Scoreboard Sidebar (1 Col) */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Scoreboard
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                {players.length} Players
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {players.map((p, idx) => {
                const isCurrent = p.uid === user?.uid;

                return (
                  <div
                    key={p.uid}
                    className={`py-2 px-1.5 flex items-center justify-between text-xs rounded transition-colors ${
                      isCurrent ? "bg-indigo-50/60 dark:bg-indigo-950/40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-slate-500 w-4 text-right">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.displayName}
                      </span>
                    </div>

                    <span className="font-bold text-[#4F46E5] dark:text-[#818CF8] shrink-0">
                      {p.score} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
