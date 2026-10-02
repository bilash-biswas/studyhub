"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Exam, Subject } from "@/types";
import { getExams } from "@/lib/services/exam-service";
import { getSubjects } from "@/lib/services/subject-service";
import { getQuestions, seedSampleQuestions } from "@/lib/services/question-service";
import {
  createLiveRoom,
  findRoomByCode,
  joinLiveRoom,
} from "@/lib/services/live-room-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users2,
  Sparkles,
  Zap,
  Play,
  KeyRound,
  Timer,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function LiveQuizLobbyPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Join Room State
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Host Room State
  const [hostExamId, setHostExamId] = useState("exam_bcs");
  const [hostSubjectId, setHostSubjectId] = useState<string>("all");
  const [hostQuestionCount, setHostQuestionCount] = useState<number>(10);
  const [hostTimePerQuestion, setHostTimePerQuestion] = useState<number>(20);
  const [isCreating, setIsCreating] = useState(false);
  const [hostError, setHostError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [exList, subList] = await Promise.all([
          getExams(),
          getSubjects(),
        ]);
        setExams(exList);
        setSubjects(subList);
      } catch (err) {
        console.error("Error loading lobby data:", err);
      }
    }
    loadData();
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    const clean = joinCode.trim().toUpperCase();
    if (clean.length < 4) {
      setJoinError("Please enter a valid room code.");
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    try {
      const room = await findRoomByCode(clean);
      if (!room) {
        setJoinError("No active quiz room found with this code.");
        return;
      }

      await joinLiveRoom(room.id, {
        uid: user.uid,
        displayName: profile?.name || user.displayName || "Candidate",
        photoURL: user.photoURL,
      });

      router.push(`/live/${room.id}`);
    } catch (err: any) {
      setJoinError(err?.message || "Failed to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreate = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsCreating(true);
    setHostError(null);
    try {
      const filter: any = { status: "published" };
      if (hostExamId) filter.examId = hostExamId;
      if (hostSubjectId !== "all") filter.subjectId = hostSubjectId;

      let res = await getQuestions(filter, 30);
      if (res.questions.length === 0) {
        await seedSampleQuestions(user.uid);
        res = await getQuestions({ status: "published" }, 30);
      }

      const selected = res.questions.slice(0, hostQuestionCount);
      if (selected.length === 0) {
        setHostError("No questions found for this exam/subject.");
        return;
      }

      const roomId = await createLiveRoom({
        hostId: user.uid,
        hostName: profile?.name || user.displayName || "Host Candidate",
        examId: hostExamId,
        subjectId: hostSubjectId !== "all" ? hostSubjectId : undefined,
        questionIds: selected.map((q) => q.id),
        timePerQuestion: hostTimePerQuestion,
      });

      router.push(`/live/${roomId}`);
    } catch (err: any) {
      setHostError(err?.message || "Failed to create live room.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) => !hostExamId || s.examId === hostExamId
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Users2 className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Multiplayer Arena
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Live Quiz Rooms (লাইভ কুইজ)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Compete in real-time head-to-head quiz matches against classmates and candidates with synchronous 20s timers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Join by Code Card */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Join with Room Code
              </h2>
              <p className="text-xs text-slate-500">
                Enter the 6-character code provided by the quiz host.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="e.g. BCS892"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="text-center font-mono text-lg tracking-widest uppercase font-bold h-12"
              />
              {joinError && (
                <div className="text-xs text-red-600 flex items-center gap-1.5 mt-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{joinError}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isJoining || !joinCode.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 gap-1.5 font-semibold"
            >
              <Zap className="h-4 w-4" />
              {isJoining ? "Entering Room..." : "Join Live Room"}
            </Button>
          </form>

          <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <strong>Room rule:</strong> All players receive questions simultaneously. Answer accurately and quickly to earn higher leaderboard scores.
          </div>
        </div>

        {/* Host a New Room Card */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Host a Quiz Room
              </h2>
              <p className="text-xs text-slate-500">
                Generate a live room code and invite your study group.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Exam */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Exam Target
              </label>
              <select
                value={hostExamId}
                onChange={(e) => {
                  setHostExamId(e.target.value);
                  setHostSubjectId("all");
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Subject
              </label>
              <select
                value={hostSubjectId}
                onChange={(e) => setHostSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Subjects (Comprehensive)</option>
                {filteredSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Questions & Timer row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Questions
                </label>
                <select
                  value={hostQuestionCount}
                  onChange={(e) => setHostQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Time / Question
                </label>
                <select
                  value={hostTimePerQuestion}
                  onChange={(e) => setHostTimePerQuestion(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100"
                >
                  <option value={15}>15 Seconds</option>
                  <option value={20}>20 Seconds</option>
                  <option value={30}>30 Seconds</option>
                </select>
              </div>
            </div>

            {hostError && (
              <div className="text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{hostError}</span>
              </div>
            )}

            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs h-10 gap-1.5 font-semibold pt-1"
            >
              <Sparkles className="h-4 w-4" />
              {isCreating ? "Creating Room..." : "Create Live Room & Code"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
