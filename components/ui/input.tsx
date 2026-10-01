import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg px-3 py-2 text-sm transition-colors",
            // Light mode styles
            "bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100",
            // Dark mode styles
            "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-950/70",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none border",
            // Error styles
            error && "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-400 dark:focus:ring-red-950/60",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
