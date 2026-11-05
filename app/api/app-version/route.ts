import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.8",
      latestBuildNumber: 9,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.9 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• শুধুমাত্র ভেরিফাইড প্রশ্ন প্রদর্শনের শতভাগ নিশ্চয়তা (Question Bank, Practice, Daily Challenge, Bookmarks, Mistakes, Live Quiz)\n• দৈনিক চ্যালেঞ্জের অফলাইন ও কোটা সুরক্ষা ব্যাকআপ (Zero-Failure Daily Challenge)\n• অ্যাপের গতি ও স্থিতিশীলতা বৃদ্ধি",
      releaseNotesEn:
        "• Strictly 100% admin-verified questions across all features\n• Zero-failure Daily Challenge with offline fallback protection\n• Performance optimizations and stability improvements",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
