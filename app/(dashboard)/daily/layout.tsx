import { Metadata } from "next";

export const metadata: Metadata = {
  title: "আজকের বিসিএস ডেইলি চ্যালেঞ্জ (Daily Brain Teaser) — Medhavi",
  description:
    "প্রতিদিন ৫টি গুরুত্বপূর্ণ বিসিএস প্রশ্ন সমাধান করে আপনার স্ট্রিক বজায় রাখুন এবং আজকের মেধাতালিকায় অংশ নিন।",
  keywords: [
    "BCS Daily Challenge",
    "বিসিএস ডেইলি কুইজ",
    "বিসিএস প্রস্তুতি",
    "BCS Question Practice",
    "Medhavi Daily Quiz",
    "BCS Brain Teaser",
  ],
  openGraph: {
    title: "আজকের বিসিএস ডেইলি চ্যালেঞ্জ — ৫টি প্রশ্ন, ৫টি বিষয় | মেধাবী",
    description:
      "প্রতিদিন ৫টি গুরুত্বপূর্ণ বিষয়ের প্রশ্ন সমাধান করে বিসিএস পরীক্ষার জন্য স্ট্রিক বজায় রাখুন এবং মেধাতালিকায় উঠুন।",
    url: "https://medhavi.vercel.app/daily",
    siteName: "Medhavi",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "আজকের বিসিএস ডেইলি চ্যালেঞ্জ — ৫টি প্রশ্ন, ৫টি বিষয় | মেধাবী",
    description:
      "প্রতিদিন ৫টি গুরুত্বপূর্ণ বিষয়ের প্রশ্ন সমাধান করে বিসিএস পরীক্ষার জন্য স্ট্রিক বজায় রাখুন।",
  },
  alternates: {
    canonical: "/daily",
  },
};

export default function DailyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
