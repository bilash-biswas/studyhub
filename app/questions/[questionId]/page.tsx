import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionById, getRelatedQuestions } from "@/lib/services/question-service";
import { getSubjects } from "@/lib/services/subject-service";
import { PublicQuestionView } from "@/components/questions/public-question-view";

export const revalidate = 86400; // ISR cache for 24 hours

interface PageProps {
  params: Promise<{ questionId: string }>;
}

const SITE_URL = "https://medhavi-nine.vercel.app";

function cleanTextForMeta(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\\n/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, "")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]+)\}/g, "√$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { questionId } = await props.params;
  const question = await getQuestionById(questionId);

  if (!question || question.status !== "published") {
    return {
      title: "প্রশ্ন পাওয়া যায়নি | মেধাবী",
      description: "অনুরোধকৃত বিসিএস প্রশ্নটি খুঁজে পাওয়া যায়নি।",
      robots: { index: false, follow: false },
    };
  }

  const cleanPrompt = cleanTextForMeta(question.question);
  const promptSnippet = cleanPrompt.length > 55 ? `${cleanPrompt.slice(0, 55)}...` : cleanPrompt;
  const title = `${promptSnippet} — বিসিএস প্রশ্ন ও সমাধান | মেধাবী`;

  const sourcePart = question.source ? `${question.source}। ` : "";
  const description = `${sourcePart}${cleanPrompt.slice(0, 130)}... সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা সহ অনুশীলন করুন মেধাবীতে।`;

  const canonicalUrl = `${SITE_URL}/questions/${question.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      ...(question.tags || []),
      question.source || "",
      "বিসিএস প্রশ্ন ব্যাংক",
      "BCS Preliminary Question",
      "BCS Question and Solution",
      "মেধাবী",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "মেধাবী (Medhavi)",
      locale: "bn_BD",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
  };
}

export default async function PublicQuestionPage(props: PageProps) {
  const { questionId } = await props.params;
  const question = await getQuestionById(questionId);

  if (!question || question.status !== "published") {
    notFound();
  }

  const [allSubjects, relatedQuestions] = await Promise.all([
    getSubjects().catch(() => []),
    getRelatedQuestions(question, 6),
  ]);

  const subject = allSubjects.find((s) => s.id === question.subjectId) || null;
  const subjectName = subject?.name || "";

  const cleanPrompt = cleanTextForMeta(question.question);
  const correctOption = question.options.find((o) => o.id === question.correctOptionId);
  const incorrectOptions = question.options.filter((o) => o.id !== question.correctOptionId);

  // 1. Google Rich Results Schema: Schema.org Quiz + Question
  const quizSchema = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: question.source ? `${question.source} Question` : "BCS MCQ Question",
    description: cleanPrompt,
    educationalLevel: "Competitive Examination / BCS Preliminary",
    hasPart: {
      "@type": "Question",
      "eduQuestionType": "Multiple choice",
      text: cleanPrompt,
      suggestedAnswer: incorrectOptions.map((opt) => ({
        "@type": "Answer",
        text: cleanTextForMeta(opt.text),
        encodingFormat: "text/plain",
      })),
      acceptedAnswer: {
        "@type": "Answer",
        text: cleanTextForMeta(correctOption?.text || ""),
        encodingFormat: "text/plain",
        ...(question.explanation
          ? {
              comment: {
                "@type": "Comment",
                text: cleanTextForMeta(question.explanation),
              },
            }
          : {}),
      },
    },
  };

  // 2. Schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "হোম",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "বিসিএস প্রশ্ন ব্যাংক",
        item: `${SITE_URL}/question-bank`,
      },
      ...(subjectName
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: subjectName,
              item: `${SITE_URL}/question-bank?subjectId=${question.subjectId}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: subjectName ? 4 : 3,
        name: question.id,
        item: `${SITE_URL}/questions/${question.id}`,
      },
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PublicQuestionView
        question={question}
        subject={subject}
        relatedQuestions={relatedQuestions}
      />
    </>
  );
}
