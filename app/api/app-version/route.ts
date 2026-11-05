import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.9",
      latestBuildNumber: 10,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "59.0 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• ডামি/ফেক ইউজার ও প্লেসহোল্ডার ডেটা সম্পূর্ণ অপসারণ\n• ফায়ারস্টোর রিয়েল-টাইম লিডারবোর্ড ইন্টিগ্রেশন (সরাসরি আসল পরীক্ষার্থীদের স্কোর প্রদর্শিত হবে)\n• লাইভ কুইজ ও স্পিড ড্রিলে ডাইনামিক ভেরিফাইড প্রশ্ন সংযুক্তকরণ\n• অ্যাপের গতি ও স্থিতিশীলতা বৃদ্ধি",
      releaseNotesEn:
        "• Complete elimination of dummy/mock user data and placeholders\n• Real-time Firestore national leaderboard integration with authentic candidates\n• Dynamic verified questions connected to Live Quiz and Speed Drills\n• Performance and stability enhancements",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
