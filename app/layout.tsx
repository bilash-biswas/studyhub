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
  title: "Medhavi (মেধাবী) — Practice. Improve. Succeed.",
  description:
    "Collaborative competitive exam preparation platform for BCS, Bank Job, and Government Career candidates in Bangladesh.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
  keywords: ["BCS", "Bank Job", "Primary Teacher", "Govt Job", "BPSC", "Exam Preparation", "MCQ Practice", "Bangladesh", "Mock Test", "Medhavi"],
  authors: [{ name: "Medhavi Team" }],
  openGraph: {
    title: "Medhavi (মেধাবী) — Practice. Improve. Succeed.",
    description: "Bangladesh Civil Service, Bank Job, and Government Career competitive exam preparation SaaS.",
    type: "website",
  },
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
