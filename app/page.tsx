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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Study<span className="text-emerald-600">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#exams" className="hover:text-emerald-600 transition-colors">
              Exams
            </a>
            <a href="#analytics" className="hover:text-emerald-600 transition-colors">
              Analytics
            </a>
            <a href="#live-quiz" className="hover:text-emerald-600 transition-colors">
              Live Quiz
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-6 border border-emerald-300/40">
            <span>🇧🇩 Built for Bangladesh Competitors</span>
            <span>•</span>
            <span>100% Free Forever</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Practice Smarter. <br className="hidden sm:inline" />
            <span className="text-emerald-600 dark:text-emerald-500">
              Prepare Better. Succeed.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Prepare for <strong>BCS Preliminary</strong>, <strong>Bank Job Recruitment</strong>, and <strong>HSC Board</strong> exams with high-yield MCQ practice, server-anchored mock tests, weakness diagnostics, and real-time multiplayer quiz rooms.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 font-semibold gap-2 shadow-md shadow-emerald-600/20">
                Start Practicing Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium">
                Sign In to Account
              </Button>
            </Link>
          </div>

          {/* Exam Badges */}
          <div id="exams" className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">Specialized Curriculums:</span>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-200">
              BCS Preliminary (৪৬তম & ৪৭তম)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-200">
              Combined 8 & 10 Banks Officer
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-200">
              HSC Science & Commerce
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Everything You Need to Crack Your Exam
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Engineered with strict exam conditions, smart revision tools, and zero subscription fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Timed Mock Exams & Negative Marking
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Server-anchored timers that survive browser refreshes. Exact negative marking rules for BCS (0.50 mark) and Bank Exams (0.25 mark).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Bengali Unicode & LaTeX Math
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Native Bengali typography with fast KaTeX math equations across questions, options, and full step-by-step solutions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Weak-Area Diagnosis & Analytics
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Rule-based weakness classification identifies your vulnerable subjects and tags with one-click practice recommendations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Mistake Bank & Bookmarking
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every wrong answer is automatically collected in your personal Mistake Bank. Retest your mistakes until you reach 100% mastery.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Real-Time Live Quiz Rooms
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Host or join live quiz rooms with fellow aspirants. Compete with synchronized question timers and instant live leaderboards.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <Bookmark className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Daily Challenges & Streaks
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Build a consistent preparation habit with 5 curated daily questions and maintain your study streak to stay motivated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Non-Affiliation Disclaimer */}
      <section className="py-10 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Independent Education Platform
          </div>
          <p>
            StudyHub is an independent study aid designed for candidate skill enhancement. StudyHub is not affiliated with, authorized, or endorsed by the Bangladesh Public Service Commission (BPSC), Bangladesh Bank, the Ministry of Education, or any government examination body.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">StudyHub</span>
            <span>— Practice. Improve. Succeed.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-emerald-600">Login</Link>
            <Link href="/register" className="hover:text-emerald-600">Register</Link>
            <span>•</span>
            <span>100% Free for all Bangladeshi Students</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
