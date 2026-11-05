import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.7",
      latestBuildNumber: 8,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.9 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• দৈনিক চ্যালেঞ্জের অফলাইন ও কোটা সুরক্ষা নিশ্চিতকরণ (Zero-Failure Daily Challenge)\n• ফায়ারস্টোর রুলস ও ডেটা সিঙ্ক অপ্টিমাইজেশন\n• অ্যাপের গতি ও স্থিতিশীলতা বৃদ্ধি",
      releaseNotesEn:
        "• Zero-failure Daily Challenge with offline fallback protection\n• Firestore rules and data sync optimization\n• App speed and performance stability",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
