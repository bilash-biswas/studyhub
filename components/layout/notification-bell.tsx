"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Flame,
  CheckCheck,
  Sparkles,
  X,
  ArrowRight,
  Pin,
} from "lucide-react";
import { AppNotification } from "@/types";
import {
  subscribeToNotifications,
  getReadNotificationIds,
  markNotificationsRead,
  formatStreakTargetBadge,
} from "@/lib/services/notification-service";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/context/language-context";
import { getEffectiveUserStreak } from "@/lib/calculations/streak";

export function NotificationBell() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t, n } = useLanguage();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [browserPermission, setBrowserPermission] =
    useState<NotificationPermission>("default");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userStreak = getEffectiveUserStreak(profile);

  useEffect(() => {
    setReadIds(getReadNotificationIds());
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(window.Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(
      userStreak,
      (list) => {
        setNotifications(list);
      },
      (newNotif) => {
        // Show floating in-app push toast
        setActiveToast(newNotif);

        // Fire native Browser Push Notification if granted
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          window.Notification.permission === "granted"
        ) {
          try {
            const sysNotif = new window.Notification(newNotif.title, {
              body: newNotif.body,
            });
            sysNotif.onclick = () => {
              window.focus();
              if (newNotif.actionUrl) {
                router.push(newNotif.actionUrl);
              }
            };
          } catch {
            // ignore on unsupported mobile browsers
          }
        }
      },
      25
    );

    return () => unsubscribe();
  }, [user, userStreak, router]);

  // Auto-hide toast after 7 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => setActiveToast(null), 7000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map((item) => item.id);
    markNotificationsRead(allIds);
    setReadIds(getReadNotificationIds());
  };

  const handleItemClick = (item: AppNotification) => {
    markNotificationsRead([item.id]);
    setReadIds(getReadNotificationIds());
    setOpen(false);
    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
  };

  const requestBrowserPushPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const perm = await window.Notification.requestPermission();
      setBrowserPermission(perm);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
            {n(unreadCount)}
          </span>
        )}
      </button>

      {/* Dropdown Notification Center */}
      {open && (
        <div className="fixed sm:absolute right-3 sm:right-0 lg:left-0 lg:right-auto top-14 sm:top-10 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t("নোটিফিকেশন ও স্ট্রিক অ্যালার্ট", "Notifications & Alerts")}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("সব পঠিত করুন", "Mark all read")}
              </button>
            )}
          </div>

          {/* Browser Push Permission Prompt */}
          {browserPermission === "default" && (
            <div className="px-3.5 py-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-indigo-900 dark:text-indigo-200 font-medium">
                {t(
                  "তাৎক্ষণিক পুশ অ্যালার্ট পেতে ব্রাউজার নোটিফিকেশন চালু করুন",
                  "Enable browser push alerts for instant updates"
                )}
              </span>
              <button
                type="button"
                onClick={requestBrowserPushPermission}
                className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-bold shrink-0 hover:bg-indigo-700"
              >
                {t("চালু করুন", "Enable")}
              </button>
            </div>
          )}

          {/* Notification Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {t("এখনো কোনো নোটিফিকেশন নেই।", "No notifications yet.")}
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !readIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 ${
                      isUnread
                        ? "bg-indigo-50/30 dark:bg-indigo-950/20"
                        : "bg-transparent"
                    }`}
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                        isUnread ? "bg-indigo-600 dark:bg-indigo-400" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.targetStreakSegment &&
                          item.targetStreakSegment !== "all" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                              <Flame className="h-2.5 w-2.5" />
                              {formatStreakTargetBadge(item)}
                            </span>
                          )}
                        {item.isPinned && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-0.5">
                            <Pin className="h-2.5 w-2.5" />
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Floating Real-Time Heads-Up Push Toast */}
      {activeToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] rounded-2xl border border-indigo-500/40 bg-slate-900 text-white p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                    {t("নতুন পুশ অ্যালার্ট", "New Push Alert")}
                  </span>
                  {activeToast.targetStreakSegment &&
                    activeToast.targetStreakSegment !== "all" && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-bold">
                        {formatStreakTargetBadge(activeToast)}
                      </span>
                    )}
                </div>
                <h4 className="text-xs font-bold text-white">{activeToast.title}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {activeToast.body}
                </p>
                {activeToast.actionUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = activeToast.actionUrl!;
                      markNotificationsRead([activeToast.id]);
                      setReadIds(getReadNotificationIds());
                      setActiveToast(null);
                      router.push(target);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-300 hover:text-white pt-1"
                  >
                    <span>{t("এখনই দেখুন", "Open Now")}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
