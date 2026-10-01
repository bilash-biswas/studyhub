"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme, Theme } from "@/lib/context/theme-context";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { label: string; value: Theme; icon: React.ReactNode }[] = [
    { label: "Light", value: "light", icon: <Sun className="h-4 w-4" /> },
    { label: "Dark", value: "dark", icon: <Moon className="h-4 w-4" /> },
    { label: "System", value: "system", icon: <Laptop className="h-4 w-4" /> },
  ];

  return (
    <div className={`relative inline-block ${className || ""}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4 text-indigo-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-xs flex items-center gap-2.5 transition-colors ${
                theme === opt.value
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
