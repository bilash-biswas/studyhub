import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer";

    const variantStyles = {
      // Primary: Indigo (Light: #4F46E5, Dark: #818CF8 text #0F172A)
      primary:
        "bg-[#4F46E5] text-white hover:bg-[#4338CA] focus-visible:ring-[#818CF8] dark:bg-[#818CF8] dark:text-[#0F172A] dark:hover:bg-[#A5B4FC] dark:focus-visible:ring-[#A5B4FC] shadow-xs font-semibold",

      // Secondary: Neutral Slate Card Button
      secondary:
        "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 shadow-xs",

      // Outline: Neutral Bordered Button
      outline:
        "border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80",

      // Ghost: Transparent Background
      ghost:
        "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",

      // Danger / Destructive: Red
      danger:
        "bg-[#EF4444] text-white hover:bg-[#DC2626] dark:bg-[#F87171] dark:text-[#0F172A] dark:hover:bg-[#FCA5A5] shadow-xs font-semibold",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
