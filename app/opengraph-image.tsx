import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "মেধাবী (Medhavi) — BCS, Bank & Govt Job Preparation Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)",
          color: "#FFFFFF",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "rgba(79, 70, 229, 0.25)",
            border: "1px solid rgba(129, 140, 248, 0.4)",
            borderRadius: "9999px",
            padding: "10px 28px",
            fontSize: "24px",
            fontWeight: 700,
            color: "#A5B4FC",
            marginBottom: "28px",
          }}
        >
          <span>10th–50th BCS Question Bank • 5,423+ Verified MCQs</span>
        </div>

        <div
          style={{
            fontSize: "76px",
            fontWeight: 900,
            letterSpacing: "-2px",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <span>Medhavi (মেধাবী)</span>
        </div>

        <div
          style={{
            fontSize: "32px",
            color: "#E2E8F0",
            textAlign: "center",
            maxWidth: "920px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          Smart BCS Preliminary, Bank Job & Govt Career Preparation Platform with Live Quizzes, Analytics & Android App
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            fontSize: "22px",
            fontWeight: 700,
            color: "#34D399",
          }}
        >
          <span>✓ 5,423+ BCS Questions</span>
          <span>•</span>
          <span>✓ Live Mock Tests</span>
          <span>•</span>
          <span>✓ KaTeX Math Solutions</span>
          <span>•</span>
          <span>✓ 100% Free</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
