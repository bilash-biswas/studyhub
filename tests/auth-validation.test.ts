import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema } from "../lib/validations/auth";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("validates valid login input", () => {
      const result = loginSchema.safeParse({
        email: "student@example.com",
        password: "secretpassword",
        rememberMe: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "secretpassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("valid email");
      }
    });

    it("rejects password shorter than 6 characters", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates complete registration", () => {
      const result = registerSchema.safeParse({
        name: "Rahim Ahmed",
        email: "rahim@example.com",
        password: "password123",
        confirmPassword: "password123",
        acceptTerms: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects password mismatch", () => {
      const result = registerSchema.safeParse({
        name: "Rahim Ahmed",
        email: "rahim@example.com",
        password: "password123",
        confirmPassword: "differentPassword",
        acceptTerms: true,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });

    it("rejects unaccepted terms", () => {
      const result = registerSchema.safeParse({
        name: "Rahim Ahmed",
        email: "rahim@example.com",
        password: "password123",
        confirmPassword: "password123",
        acceptTerms: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("accept the terms");
      }
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates valid email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "student@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
