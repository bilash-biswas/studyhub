import React from "react";
import { Metadata } from "next";

const SITE_URL = "https://medhavi-nine.vercel.app";

export const metadata: Metadata = {
  title: "মেধাবী অ্যান্ড্রয়েড অ্যাপ ডাউনলোড (APK v1.0.5) — বিসিএস প্রশ্ন ব্যাংক ও অফলাইন মডেল টেস্ট",
  description:
    "১০ম থেকে ৫০তম বিসিএসের ৫,৪২০+ প্রশ্ন ব্যাংক অফলাইনে অনুশীলন ও লাইভ মডেল টেস্ট দিতে মেধাবী (Medhavi) অ্যান্ড্রয়েড অ্যাপের লেটেস্ট রিলিজ APK ডাউনলোড করুন।",
  alternates: {
    canonical: `${SITE_URL}/download`,
  },
  keywords: [
    "মেধাবী অ্যাপ ডাউনলোড",
    "Medhavi APK download",
    "বিসিএস প্রস্তুতি অ্যাপ",
    "BCS Question Bank APK",
    "BCS Android App Bangladesh",
    "সরকারি চাকরি প্রস্তুতি অ্যাপ",
  ],
  openGraph: {
    title: "মেধাবী অ্যান্ড্রয়েড অ্যাপ ডাউনলোড (APK v1.0.5) — বিসিএস প্রশ্ন ব্যাংক",
    description:
      "৫,৪২০+ বিসিএস প্রশ্ন ব্যাংক, অফলাইন অনুশীলন এবং লাইভ মডেল টেস্ট — সরাসরি আপনার অ্যান্ড্রয়েড ফোনে।",
    url: `${SITE_URL}/download`,
    siteName: "মেধাবী (Medhavi)",
    locale: "bn_BD",
    type: "website",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "মেধাবী (Medhavi) — বিসিএস প্রশ্ন ব্যাংক ও প্রস্তুতি",
  operatingSystem: "Android 7.0+",
  applicationCategory: "EducationalApplication",
  softwareVersion: "1.0.5",
  fileSize: "58.6MB",
  downloadUrl: `${SITE_URL}/downloads/medhavi-app.apk`,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BDT",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "128",
  },
  description:
    "১০ম থেকে ৫০তম বিসিএসের ৫,৪২০+ ভেরিফাইড প্রশ্ন ব্যাংক, বিস্তারিত ব্যাখ্যা, লাইভ কুইজ এবং ব্যাংক ও সরকারি চাকরির প্রস্তুতি অ্যাপ।",
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      {children}
    </>
  );
}
