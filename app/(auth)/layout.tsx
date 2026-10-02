import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0F172A] px-4 py-8 sm:px-6 lg:px-8 transition-colors">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            <span>BCS</span>
            <span>•</span>
            <span>Bank</span>
            <span>•</span>
            <span>HSC</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Medha<span className="text-[#4F46E5] dark:text-[#818CF8]">vi</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            &quot;Practice. Improve. Succeed.&quot;
          </p>
        </div>

        {children}
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 dark:text-slate-500">
        <p>© {new Date().getFullYear()} Medhavi Bangladesh (মেধাবী). 100% Free for all students.</p>
      </div>
    </div>
  );
}
