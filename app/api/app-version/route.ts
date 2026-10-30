import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.4",
      latestBuildNumber: 5,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.6 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• প্রশ্ন ব্যাংকে নতুন 'কমপ্যাক্ট ভিউ' (এক নজরে দ্রুত পড়ার অ্যাকোর্ডিয়ন ভিউ)\n• অপশন ও নেভিগেশনে মসৃণ হ্যাপ্টিক টাচ অনুভূতি\n• নোশন-স্টাইল মার্জিত সমাধান কার্ড ও ১-ক্লিকে সমাধান কপি সুবিধা\n• ওয়েব প্র্যাকটিসে কীবোর্ড শর্টকাট (1-4, তীর চিহ্ন, F, Space)",
      releaseNotesEn:
        "• Question Bank 'Compact View' for fast, single-glance review\n• Tactile micro-haptics on option selection & navigation\n• Notion-style left-accent solution card with 1-click copy\n• Web keyboard navigation shortcuts (1-4, Arrow keys, F, Space)",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
