import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.5",
      latestBuildNumber: 6,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.6 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• বিসিএস ব্যাচভিত্তিক ফিল্টারিং ফিক্স (১০ম থেকে ৫০তম বিসিএস)\n• প্রশ্নব্যাংক অপশন ব্যাজ ও সঠিক উত্তর সিলেকশন আপডেট\n• LaTeX গণিত সমীকরণ ও প্রতীক ফরম্যাটিং সুরক্ষা",
      releaseNotesEn:
        "• Fixed BCS batch filtering across 10th to 50th BCS\n• Improved question option badges & correct option selection\n• Enhanced LaTeX math formula & symbol protection",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
