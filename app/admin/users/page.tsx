"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types";
import {
  getUsers,
  updateUserRole,
  toggleUserActive,
} from "@/lib/services/user-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  ShieldCheck,
  User,
  Search,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const list = await getUsers(50);
      setUsers(list);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleToggleRole = async (user: UserProfile) => {
    const newRole: UserRole = user.role === "admin" ? "user" : "admin";
    try {
      await updateUserRole(user.uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    const newStatus = !user.isActive;
    try {
      await toggleUserActive(user.uid, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, isActive: newStatus } : u))
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            User Management (ব্যবহারকারী ব্যবস্থাপনা)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View registered candidates, student progress, and assign administrator privileges.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Candidates: <strong className="text-slate-900 dark:text-slate-100">{users.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by candidate name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading candidate records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
          No users match the search query.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === "admin";

              return (
                <div
                  key={u.uid}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300 shrink-0">
                      {(u.name || u.email || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {u.name || "Anonymous Candidate"}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isAdmin
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                              : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          }`}
                        >
                          {isAdmin ? "Admin" : "Student"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pl-13 sm:pl-0">
                    {/* Activity Stats */}
                    <div className="text-right text-xs">
                      <div className="text-slate-700 dark:text-slate-300 font-semibold">
                        {u.totalQuestionsAnswered || 0} Questions
                      </div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                        <Flame className="h-3 w-3 fill-current" />
                        <span>{u.currentStreak || 0} day streak</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(u)}
                        className="text-xs h-7"
                      >
                        {isAdmin ? "Make Student" : "Promote to Admin"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs h-7 ${
                          u.isActive
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            : "text-emerald-600 hover:text-emerald-700"
                        }`}
                      >
                        {u.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
