import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.1",
      latestBuildNumber: 2,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.2 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• প্রশ্ন ব্যাংকের নতুন ক্লিন ও মিনিমাল ডিজাইন\n• দ্রুত নেভিগেশন ও পারফরম্যান্স উন্নতি\n• ইন-অ্যাপ স্বয়ংক্রিয় আপডেট সুবিধা",
      releaseNotesEn:
        "• Minimal Question Bank and Question Card redesign\n• Faster navigation and performance improvements\n• In-app self-update support",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
