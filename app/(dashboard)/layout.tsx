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
  Flame,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/context/language-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { DashboardShellSkeleton } from "@/components/ui/skeletons";

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

  // Guest-friendly routes: /question-bank and /daily can be browsed publicly by search crawlers and guests
  const isGuestAllowedRoute =
    pathname === "/question-bank" ||
    Boolean(pathname?.startsWith("/question-bank")) ||
    pathname === "/daily";

  // Auth Protection: If not logged in and done loading, redirect to login (except guest allowed routes)
  useEffect(() => {
    if (!loading && !user && !isGuestAllowedRoute) {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.push(`/login${redirectParam}`);
    }
  }, [user, loading, router, isGuestAllowedRoute, pathname]);

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
    {
      label: t("দৈনিক চ্যালেঞ্জ", "Daily Challenge"),
      href: "/daily",
      icon: Flame,
      badge: profile?.currentStreak ? `${profile.currentStreak} 🔥` : undefined,
    },
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
    return <DashboardShellSkeleton />;
  }

  if (!user && !isGuestAllowedRoute) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[268px] flex-col fixed inset-y-0 z-30 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800">
        {/* Brand */}
        <div className="h-16 flex items-center justify-between gap-2 px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href={user ? "/dashboard" : "/question-bank"} className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
              {t("মেধাবী", "Medhavi")}
            </span>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <NotificationBell />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* User / Guest Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          {user ? (
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
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t("অতিথি শিক্ষার্থী", "Guest Student")}</span>
              </div>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
              >
                {t("লগইন / রেজিস্টার", "Sign In / Register")}
              </Link>
            </div>
          )}
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
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81] dark:text-[#A5B4FC] font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? "text-[#4F46E5] dark:text-[#A5B4FC]"
                        : item.href === "/daily"
                        ? "text-amber-500 fill-amber-500/20"
                        : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                    {item.badge}
                  </span>
                )}
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
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {t("লগআউট", "Sign Out")}
            </button>
          ) : (
            <Link
              href="/download"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <span>{t("অ্যাপ ডাউনলোড (APK)", "Download APK")}</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[268px] flex flex-col min-w-0 pb-16 lg:pb-0">
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium ${
                    isActive
                      ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81] dark:text-[#A5B4FC] font-semibold"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-[#4F46E5] dark:text-[#A5B4FC]"
                          : item.href === "/daily"
                          ? "text-amber-500 fill-amber-500/20"
                          : "text-slate-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                      {item.badge}
                    </span>
                  )}
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
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-600 pt-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                {t("লগআউট", "Sign Out")}
              </button>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white"
                >
                  {t("লগইন / রেজিস্টার", "Sign In / Register")}
                </Link>
                <Link
                  href="/download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                >
                  {t("অ্যাপ ডাউনলোড (APK)", "Download APK")}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {!user && isGuestAllowedRoute && (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  {t(
                    "আপনি অতিথি হিসেবে প্রশ্ন ব্যাংক ব্রাউজ করছেন। বুকমার্ক সংরক্ষণ ও পূর্ণাঙ্গ মডেল টেস্ট দিতে অ্যাকাউন্ট তৈরি করুন।",
                    "You are browsing Medhavi as a guest. Create a free account to save bookmarks and take timed mock tests."
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/download"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  {t("অ্যাপ ডাউনলোড (APK)", "Get App")}
                </Link>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t("লগইন", "Sign In")}
                </Link>
              </div>
            </div>
          )}
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
