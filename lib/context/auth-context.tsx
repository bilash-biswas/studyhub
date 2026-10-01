"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  getDoc,
  setDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { auth, googleProvider, getFriendlyAuthErrorMessage } from "@/lib/firebase/auth";
import { db, userDoc } from "@/lib/firebase/firestore";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to load or create user profile from Firestore
  const fetchOrCreateProfile = async (firebaseUser: User, fallbackName?: string): Promise<UserProfile | null> => {
    try {
      const userRef = userDoc(firebaseUser.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }

      // First time registration or Google sign-in: create user profile
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: fallbackName || firebaseUser.displayName || "Student",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || null,
        role: "user",
        isActive: true,
        totalAttempts: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    } catch (err) {
      console.error("Error reading or creating user profile:", err);
      // Return temporary profile fallback so user is not completely blocked
      return {
        uid: firebaseUser.uid,
        name: fallbackName || firebaseUser.displayName || "Student",
        email: firebaseUser.email || "",
        role: "user",
        isActive: true,
        totalAttempts: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProfile = await fetchOrCreateProfile(currentUser);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchOrCreateProfile(user);
      setProfile(userProfile);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const userProfile = await fetchOrCreateProfile(credential.user);
      setProfile(userProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFriendlyAuthErrorMessage(err?.code || "") };
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      // Update Auth display name
      await updateProfile(credential.user, { displayName: name.trim() });
      const userProfile = await fetchOrCreateProfile(credential.user, name.trim());
      setProfile(userProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFriendlyAuthErrorMessage(err?.code || "") };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const userProfile = await fetchOrCreateProfile(credential.user);
      setProfile(userProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFriendlyAuthErrorMessage(err?.code || "") };
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFriendlyAuthErrorMessage(err?.code || "") };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const isAdmin = Boolean(profile?.role === "admin" && profile?.isActive);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
