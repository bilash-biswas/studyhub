/**
 * StudyHub Centralized MCQ & Exam Palette Style Tokens
 * Implements the strict Indigo + Sky + Emerald + Amber + Red + Slate visual system.
 */

export type OptionState = "normal" | "selected" | "correct" | "wrong" | "skipped";
export type PaletteState = "unanswered" | "answered" | "marked" | "current";

/**
 * Returns exact Tailwind classes for MCQ option container based on answer state
 */
export function getOptionContainerStyles(state: OptionState): string {
  switch (state) {
    case "selected":
      return "bg-[#EEF2FF] border-[#4F46E5] text-[#3730A3] dark:bg-[#312E81] dark:border-[#818CF8] dark:text-[#E0E7FF] shadow-xs";
    case "correct":
      return "bg-[#ECFDF5] border-[#10B981] text-[#047857] dark:bg-[#064E3B] dark:border-[#34D399] dark:text-[#A7F3D0]";
    case "wrong":
      return "bg-[#FEF2F2] border-[#EF4444] text-[#B91C1C] dark:bg-[#450A0A] dark:border-[#F87171] dark:text-[#FCA5A5]";
    case "skipped":
      return "bg-[#FFFBEB] border-[#F59E0B] text-[#B45309] dark:bg-[#451A03] dark:border-[#FBBF24] dark:text-[#FCD34D]";
    case "normal":
    default:
      return "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";
  }
}

/**
 * Returns exact badge/indicator styles for option letter (A, B, C, D)
 */
export function getOptionBadgeStyles(state: OptionState): string {
  switch (state) {
    case "selected":
      return "bg-[#4F46E5] text-white dark:bg-[#818CF8] dark:text-[#0F172A]";
    case "correct":
      return "bg-[#10B981] text-white dark:bg-[#34D399] dark:text-[#0F172A]";
    case "wrong":
      return "bg-[#EF4444] text-white dark:bg-[#F87171] dark:text-[#0F172A]";
    case "skipped":
      return "bg-[#F59E0B] text-white dark:bg-[#FBBF24] dark:text-[#0F172A]";
    case "normal":
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

/**
 * Returns exact styles for question palette indicators
 */
export function getPaletteButtonStyles(state: PaletteState): string {
  switch (state) {
    case "current":
      return "bg-[#4F46E5] text-white border-[#4F46E5] dark:bg-[#818CF8] dark:text-[#0F172A] dark:border-[#818CF8] font-bold shadow-xs";
    case "answered":
      return "bg-[#EEF2FF] text-[#3730A3] border-[#4F46E5] dark:bg-[#312E81] dark:text-[#E0E7FF] dark:border-[#818CF8] font-semibold";
    case "marked":
      return "bg-[#FFFBEB] text-[#B45309] border-[#F59E0B] dark:bg-[#451A03] dark:text-[#FCD34D] dark:border-[#FBBF24] font-semibold";
    case "unanswered":
    default:
      return "bg-transparent text-slate-600 border-slate-300 hover:bg-slate-100 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800";
  }
}

/**
 * Returns exam timer colors based on remaining seconds
 */
export function getTimerColorStyles(remainingSeconds: number): string {
  if (remainingSeconds <= 60) {
    return "text-[#EF4444] dark:text-[#F87171] animate-pulse"; // Critical <= 1 min
  }
  if (remainingSeconds <= 300) {
    return "text-[#F59E0B] dark:text-[#FBBF24]"; // Warning <= 5 min
  }
  return "text-[#4F46E5] dark:text-[#818CF8]"; // Normal
}
