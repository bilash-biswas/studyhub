import Link from "next/link";
import {
  GraduationCap,
  CheckCircle,
  Timer,
  BarChart3,
  Bookmark,
  Users,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#0F172A]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Medha<span className="text-[#4F46E5] dark:text-[#818CF8]">vi</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#exams" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Exams
            </a>
            <a href="#analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Analytics
            </a>
            <a href="#live-quiz" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Live Quiz
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 mb-6 border border-indigo-200 dark:border-indigo-800">
            <span>🇧🇩 Tailored for Bangladesh Candidates</span>
            <span>•</span>
            <span>100% Free SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.15]">
            Practice Smarter. <br className="hidden sm:inline" />
            <span className="text-[#4F46E5] dark:text-[#818CF8]">
              Prepare Better. Succeed.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Prepare for <strong>BCS Preliminary</strong>, <strong>Bank Job Recruitment</strong>, and <strong>HSC Board</strong> exams with structured MCQ practice, timestamp-anchored mock tests, weakness analytics, and real-time live quizzes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 shadow-md shadow-indigo-600/20">
                Start Practicing Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign In to Account
              </Button>
            </Link>
          </div>

          {/* Exam Badges */}
          <div id="exams" className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">Target Curriculums:</span>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-slate-800 dark:text-slate-200">
              BCS Preliminary (৪৬তম ও ৪৭তম)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-slate-800 dark:text-slate-200">
              Combined 8 & 10 Banks Officer
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-slate-800 dark:text-slate-200">
              HSC Science & Commerce
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Academic Productivity Engine
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Engineered with official exam conditions, negative marking, and zero distraction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Timer / Exam */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-400/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Timed Mock Exams & Negative Marking
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Server-anchored timers immune to browser refreshes. Exact negative marking rules for BCS (0.50 mark) and Bank recruitment (0.25 mark).
              </p>
            </div>

            {/* Feature 2 - Mixed Math & Bengali */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-400/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Bengali Unicode & LaTeX Math
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Crisp Bengali typography powered by Noto/Hind Siliguri and KaTeX math formulas across questions, options (A, B, C, D), and detailed explanations.
              </p>
            </div>

            {/* Feature 3 - Analytics */}
            <div id="analytics" className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-400/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Weak-Area Diagnosis & Analytics
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Rule-based weakness classification identifies vulnerable subjects and tags with one-click targeted practice recommendations.
              </p>
            </div>

            {/* Feature 4 - Mistake Bank */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-400/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Mistake Bank & Bookmarking
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every wrong answer is automatically cataloged in your personal Mistake Bank. Retest your mistakes repeatedly until you achieve 100% mastery.
              </p>
            </div>

            {/* Feature 5 - Live Quiz */}
            <div id="live-quiz" className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-sky-400/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Real-Time Live Quiz Rooms
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Host or join live quiz rooms with fellow students. Compete with synchronized question timers and instantaneous live leaderboards.
              </p>
            </div>

            {/* Feature 6 - Daily Challenges */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-amber-400/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Daily Challenges & Streaks
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Build study consistency with 5 curated daily questions and maintain your consecutive study streak to stay motivated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Non-Affiliation Disclaimer */}
      <section className="py-10 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Independent Education Platform
          </div>
          <p>
            Medhavi is an independent study aid designed for candidate skill enhancement. Medhavi is not affiliated with, authorized, or endorsed by the Bangladesh Public Service Commission (BPSC), Bangladesh Bank, the Ministry of Education, or any government examination body.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white dark:bg-[#111827] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#4F46E5] dark:text-[#818CF8]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Medhavi</span>
            <span>— Practice. Improve. Succeed.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400">Login</Link>
            <Link href="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400">Register</Link>
            <span>•</span>
            <span>100% Free for all Bangladeshi Students</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
