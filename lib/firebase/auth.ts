import {
  getAuth,
  GoogleAuthProvider,
  Auth,
} from "firebase/auth";
import { app } from "./config";

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Translates Firebase Auth error codes into helpful user-facing error messages
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please login instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled. Please contact support.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/user-disabled":
      return "This account has been deactivated. Please contact support.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please wait a few moments and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing. Please try again.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    default:
      return "An unexpected authentication error occurred. Please try again.";
  }
}
