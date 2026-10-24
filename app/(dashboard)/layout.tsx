"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Timer,
  Bookmark,
  AlertTriangle,
  BarChart3,
  Trophy,
  Users2,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/context/language-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // LinkedIn-style Auto-Hiding Mobile Header & Bottom Nav State
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Auth Protection: If not logged in and done loading, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Scroll listener for LinkedIn-style mobile navigation hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 24 || mobileMenuOpen) {
        setIsNavVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY.current;
      if (delta > 8) {
        // Scrolling down -> hide top app bar and bottom nav
        setIsNavVisible(false);
        lastScrollY.current = currentScrollY;
      } else if (delta < -8) {
        // Scrolling up -> show top app bar and bottom nav
        setIsNavVisible(true);
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

  const navItems = [
    { label: t("ড্যাশবোর্ড", "Dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("প্রশ্ন ব্যাংক", "Question Bank"), href: "/question-bank", icon: BookOpen },
    { label: t("অনুশীলন", "Practice"), href: "/practice", icon: Sparkles },
    { label: t("মডেল টেস্ট", "Mock Exams"), href: "/exams", icon: Timer },
    { label: t("ভুল ব্যাংক", "Mistake Bank"), href: "/mistakes", icon: AlertTriangle },
    { label: t("বুকমার্ক", "Bookmarks"), href: "/bookmarks", icon: Bookmark },
    { label: t("অ্যানালিটিক্স", "Analytics"), href: "/analytics", icon: BarChart3 },
    { label: t("মেধাতালিকা", "Leaderboard"), href: "/leaderboard", icon: Trophy },
    { label: t("লাইভ কুইজ", "Live Quiz"), href: "/live", icon: Users2 },
    { label: t("প্রোফাইল", "Profile"), href: "/profile", icon: User },
    { label: t("সেটিংস", "Settings"), href: "/settings", icon: Settings },
  ];

  const bottomNavItems = [
    { label: t("হোম", "Home"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("প্রশ্ন ব্যাংক", "Q-Bank"), href: "/question-bank", icon: BookOpen },
    { label: t("অনুশীলন", "Practice"), href: "/practice", icon: Sparkles },
    { label: t("পরীক্ষা", "Exams"), href: "/exams", icon: Timer },
    { label: t("বুকমার্ক", "Bookmarks"), href: "/bookmarks", icon: Bookmark },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            {t("মেধাবী ওয়ার্কস্পেস লোড হচ্ছে...", "Loading Medhavi workspace...")}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800">
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t("মেধাবী", "Medhavi")}
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-xs shrink-0 border border-indigo-200 dark:border-indigo-800">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : "MD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">
                {profile?.name || user.displayName || t("প্রার্থী", "Candidate")}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {profile?.email || user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81] dark:text-[#A5B4FC] font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#4F46E5] dark:text-[#A5B4FC]" : "text-slate-500"}`} />
                {item.label}
              </Link>
            );
          })}

          {/* Admin Link if role is Admin */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors mt-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {t("অ্যাডমিন প্যানেল", "Admin Panel")}
            </Link>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {t("লগআউট", "Sign Out")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Mobile Top Header (LinkedIn-style Auto-Hiding on Scroll Down) */}
        <header
          className={`lg:hidden h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 transition-transform duration-300 ease-in-out ${
            isNavVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {t("মেধাবী", "Medhavi")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 p-4 space-y-1 sticky top-14 z-20 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                    isActive
                      ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81] dark:text-[#A5B4FC] font-semibold"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-purple-600"
              >
                <ShieldCheck className="h-4 w-4" />
                {t("অ্যাডমিন প্যানেল", "Admin Panel")}
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-600 pt-2"
            >
              <LogOut className="h-4 w-4" />
              {t("লগআউট", "Sign Out")}
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (LinkedIn-style Auto-Hiding on Scroll Down) */}
        <div
          className={`lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-14 px-2 transition-transform duration-300 ease-in-out ${
            isNavVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-[#4F46E5] dark:text-[#818CF8]"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 mb-0.5 ${isActive ? "text-[#4F46E5] dark:text-[#818CF8]" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
