import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.3",
      latestBuildNumber: 4,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "58.4 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• প্র্যাকটিসে প্রশ্ন পরিবর্তন করতে বামে/ডানে সোয়াইপ (Swipe)\n• প্রশ্ন চিহ্নিত করার সুবিধা (Flag for Review)\n• উত্তর বিশ্লেষণ ও বিশদ ব্যাখ্যা মোড (ভুল, সঠিক ফিল্টার সহ)\n• প্র্যাকটিস হাবে প্রতিটি বিষয়ের ৩ পিক্সেল অগ্রগতি বার",
      releaseNotesEn:
        "• Horizontal swipe gesture for next/previous question navigation\n• Flag / Mark for Review with amber palette indicator\n• Answer Review mode with mistake filters & instant explanations\n• Subject mastery micro-progress bar on Practice Hub",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
