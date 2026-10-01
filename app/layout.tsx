import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bengali",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  display: "swap",
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "StudyHub — Practice. Improve. Succeed.",
  description:
    "Collaborative online exam-preparation platform for BCS, Bank Job, and HSC candidates in Bangladesh.",
  keywords: ["BCS", "Bank Job", "HSC", "Exam Preparation", "MCQ Practice", "Bangladesh", "Mock Test"],
  authors: [{ name: "StudyHub Team" }],
};

import { AuthProvider } from "@/lib/context/auth-context";
import { ThemeProvider } from "@/lib/context/theme-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
