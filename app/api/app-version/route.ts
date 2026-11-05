import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.7",
      latestBuildNumber: 8,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.8 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• নতুন দৈনিক ৫-প্রশ্নের চ্যালেঞ্জ ও ৭ দিনের স্ট্রিক ট্র্যাকার\n• ওয়ার্ডল-স্টাইল শেয়ারযোগ্য ইমোজি রেজাল্ট কার্ড\n• প্রশ্ন ব্যাংকে লাইভ ভেরিফায়েড প্রশ্ন সংখ্যা ও ব্যাচ এরা ফিল্টারিং\n• প্রশ্ন কার্ডে রঙিন ডিফিকাল্টি ও ভেরিফায়েড শিল্ড ব্যাজ",
      releaseNotesEn:
        "• New Daily 5-Question Challenge with 7-day streak tracker\n• Wordle-style shareable emoji result card\n• Live verified question counts & Batch Era filters in Question Bank\n• Question card difficulty & verified shield badges",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
