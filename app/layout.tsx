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
  maximumScale: 5,
  themeColor: "#4F46E5",
};

const SITE_URL = "https://medhavi-nine.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "মেধাবী (Medhavi) — বিসিএস প্রশ্ন ব্যাংক, মডেল টেস্ট ও চাকরি প্রস্তুতি",
    template: "%s | মেধাবী (Medhavi)",
  },
  description:
    "১০ম থেকে ৫০তম বিসিএসের ৫,৪২৩+ ভেরিফাইড প্রশ্ন ব্যাংক, বিস্তারিত ব্যাখ্যা, লাইভ কুইজ, ব্যাংক জব ও সরকারি চাকরির পূর্ণাঙ্গ অনলাইন প্রস্তুতি প্ল্যাটফর্ম। Complete BCS Preliminary, Bank Job & Govt Career MCQ Preparation Platform in Bangladesh.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
      "en-US": "/",
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  keywords: [
    "মেধাবী",
    "Medhavi",
    "বিসিএস প্রশ্ন ব্যাংক",
    "১০ম থেকে ৫০তম বিসিএস প্রশ্ন ও সমাধান",
    "৪৬তম বিসিএস মডেল টেস্ট",
    "বিসিএস প্রিলিমিনারি প্রস্তুতি",
    "ব্যাংক জব প্রস্তুতি",
    "প্রাইমারি শিক্ষক নিয়োগ প্রস্তুতি",
    "সরকারি চাকরি প্রস্তুতি অ্যাপ",
    "BCS Question Bank",
    "10th to 50th BCS Questions with Solution",
    "BCS Preliminary Mock Test",
    "46th BCS Preparation",
    "Bank Job MCQ Bangladesh",
    "BPSC Exam Preparation",
  ],
  authors: [{ name: "Medhavi Team", url: SITE_URL }],
  creator: "Medhavi (মেধাবী)",
  publisher: "Medhavi (মেধাবী)",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "মেধাবী (Medhavi) — ১০ম–৫০তম বিসিএস প্রশ্ন ব্যাংক ও মডেল টেস্ট",
    description:
      "৫,৪২৩+ বিসিএস প্রিলিমিনারি প্রশ্ন ও সমাধান, কাস্টম অনুশীলন, লাইভ কুইজ এবং অ্যান্ড্রয়েড মোবাইল অ্যাপ — সম্পূর্ণ বিনামূল্যে।",
    url: SITE_URL,
    siteName: "মেধাবী (Medhavi)",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "মেধাবী (Medhavi) — ১০ম–৫০তম বিসিএস প্রশ্ন ব্যাংক ও মডেল টেস্ট",
    description:
      "৫,৪২৩+ বিসিএস প্রিলিমিনারি প্রশ্ন ও সমাধান, কাস্টম অনুশীলন, লাইভ কুইজ এবং অ্যান্ড্রয়েড অ্যাপ।",
  },
};

import { AuthProvider } from "@/lib/context/auth-context";
import { ThemeProvider } from "@/lib/context/theme-context";
import { LanguageProvider } from "@/lib/context/language-context";

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "মেধাবী (Medhavi)",
      alternateName: "Medhavi BCS & Job Preparation Platform",
      url: SITE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web, Android",
      inLanguage: ["bn", "en"],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BDT",
      },
      description:
        "১০ম থেকে ৫০তম বিসিএসের ৫,৪২৩+ ভেরিফাইড প্রশ্ন ব্যাংক, বিস্তারিত ব্যাখ্যা, লাইভ কুইজ এবং ব্যাংক ও সরকারি চাকরির প্রস্তুতি প্ল্যাটফর্ম।",
    },
    {
      "@type": "EducationalOrganization",
      name: "মেধাবী (Medhavi)",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: ["https://github.com/bilash-biswas/studyhub"],
    },
  ],
};

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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
