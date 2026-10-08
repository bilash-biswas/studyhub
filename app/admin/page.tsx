"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  FolderTree,
  BookOpen,
  Users,
  FileCheck2,
  TrendingUp,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { getExams } from "@/lib/services/exam-service";
import { getQuestions, seedSampleQuestions } from "@/lib/services/question-service";
import { seedDefaultCatalogs } from "@/lib/services/seed-catalogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [examCount, setExamCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const exams = await getExams(true);
    setExamCount(exams.length);

    const questionsRes = await getQuestions({}, 50);
    setQuestionCount(questionsRes.questions.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const catRes = await seedDefaultCatalogs();
      const qRes = await seedSampleQuestions(user?.uid || "admin");
      setSeedMessage(`Seeded ${catRes.examCount} exams, ${catRes.subjectCount} subjects, and ${qRes} sample questions!`);
      await fetchStats();
    } catch (err: any) {
      setSeedMessage(`Seeding error: ${err?.message || "Failed"}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage question banks, exams, curricula, and system parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            isLoading={isSeeding}
            className="text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Seed Default Curricula & Questions
          </Button>

          <Link href="/admin/questions/new">
            <Button variant="primary" size="sm" className="text-xs gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      {seedMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
          {seedMessage}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Questions</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">
                {loading ? "..." : questionCount}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Exam Tracks</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">
                {loading ? "..." : examCount}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FolderTree className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Infrastructure</p>
              <h3 className="text-sm font-bold mt-2 text-emerald-600 dark:text-emerald-400">
                $0 / 0 BDT (Hobby)
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">User Mode</p>
              <h3 className="text-sm font-bold mt-2 text-indigo-600 dark:text-indigo-400 capitalize">
                Administrator
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link href="/admin/questions" className="group">
          <Card className="h-full hover:border-indigo-400/60 dark:hover:border-indigo-600/60 transition-all">
            <CardHeader className="pb-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <HelpCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Question Management
              </CardTitle>
              <CardDescription className="text-xs">
                Create, filter, publish, and edit MCQs with Bengali Unicode and KaTeX equations.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/exams" className="group">
          <Card className="h-full hover:border-indigo-400/60 dark:hover:border-indigo-600/60 transition-all">
            <CardHeader className="pb-3">
              <div className="h-9 w-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
                <FolderTree className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Exam Categories
              </CardTitle>
              <CardDescription className="text-xs">
                Configure BCS, Bank Job, Primary & Govt Jobs, and add future recruitment tracks.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/subjects" className="group">
          <Card className="h-full hover:border-indigo-400/60 dark:hover:border-indigo-600/60 transition-all">
            <CardHeader className="pb-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Subject Curricula
              </CardTitle>
              <CardDescription className="text-xs">
                Manage syllabus subjects, descriptions, and sequence ordering.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
