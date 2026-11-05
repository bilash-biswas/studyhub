import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      latestVersion: "1.0.10",
      latestBuildNumber: 11,
      minSupportedBuildNumber: 1,
      apkUrl: "https://medhavi-nine.vercel.app/downloads/medhavi-app.apk",
      apkSize: "59.0 MB",
      forceUpdate: false,
      releaseNotesBn:
        "• দৈনিক চ্যালেঞ্জের ফলাফল ও আসল স্কোর লোডিং সমস্যার সমাধান\n• 'পুনরায় অনুশীলন করুন' বাটন সংযোজন (দৈনিক চ্যালেঞ্জ যেকোনো সময় রিভিউ ও প্র্যাকটিস করার সুবিধা)\n• KaTeX সমীকরণ ও ব্যাখ্যা প্রদর্শন উন্নতকরণ",
      releaseNotesEn:
        "• Fixed Daily Challenge result loading & score synchronization bug\n• Added 'Practice Again' feature allowing candidates to review and test anytime\n• KaTeX equations and Bengali explanations rendered smoothly",
      publishedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
