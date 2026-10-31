import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.6",
      latestBuildNumber: 7,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.6 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• শুধুমাত্র যাচাইকৃত প্রশ্ন প্রদর্শনের নিশ্চয়তা\n• নির্ভুল উত্তরমালা ও ৪টি পূর্ণাঙ্গ অপশন নিশ্চিতকরণ\n• অ্যাপের গতি ও স্থিতিশীলতা বৃদ্ধি",
      releaseNotesEn:
        "• Guaranteed verified questions only across Question Bank and Practice\n• Accurate answer keys and full 4 options for all questions\n• Performance and stability enhancements",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
