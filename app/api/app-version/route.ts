import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.2",
      latestBuildNumber: 3,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.4 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• সকল স্ক্রিনে পুল-টু-রিফ্রেশ (Pull to refresh) ও হ্যাপ্টিক ফিডব্যাক\n• খালি তালিকাতেও সহজে রিফ্রেশ করার সুবিধা\n• দ্রুত ডেটা সিঙ্ক্রোনাইজেশন ও পারফরম্যান্স উন্নতি",
      releaseNotesEn:
        "• Unified Pull-to-Refresh with haptic feedback across all screens\n• Always-scrollable empty state refresh support\n• Faster cloud synchronization & stability",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
