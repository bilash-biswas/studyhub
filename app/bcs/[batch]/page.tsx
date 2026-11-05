import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBatchMeta,
  getQuestionsForBatch,
  normalizeBatchSlug,
} from "@/lib/services/batch-service";
import { getSubjects } from "@/lib/services/subject-service";
import { BatchQuestionsView } from "@/components/bcs/batch-questions-view";

export const revalidate = 86400; // 24 hours ISR caching

interface PageProps {
  params: Promise<{ batch: string }>;
}

const SITE_URL = "https://medhavi-nine.vercel.app";

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { batch } = await props.params;
  const batchId = normalizeBatchSlug(batch);
  const meta = getBatchMeta(batchId);

  if (!meta) {
    return {
      title: "বিসিএস প্রশ্নপত্র পাওয়া যায়নি | মেধাবী",
      description: "অনুরোধকৃত বিসিএস পরীক্ষার প্রশ্নপত্র খুঁজে পাওয়া যায়নি।",
      robots: { index: false, follow: false },
    };
  }

  const title = `${meta.labelBn} প্রিলিমিনারি প্রশ্ন ও সম্পূর্ণ সমাধান (PDF) | মেধাবী`;
  const description = `${meta.labelBn} (${meta.labelEn}) প্রিলিমিনারি পরীক্ষার প্রশ্ন, নির্ভুল উত্তর ও বিস্তারিত ব্যাখ্যা। অনলাইনে বিষয়ভিত্তিক অনুশীলন করুন অথবা অফলাইন স্টাডি শীট প্রিন্ট করুন।`;
  const canonicalUrl = `${SITE_URL}/bcs/${meta.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      `${meta.labelBn} প্রশ্ন ও সমাধান`,
      `${meta.labelEn} Preliminary Question Solution`,
      `${meta.labelEn} Question Bank`,
      "বিসিএস প্রিলিমিনারি প্রশ্ন সমাধান",
      "BCS Question Solution PDF",
      "মেধাবী",
    ],
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

export default async function BcsBatchDetailPage(props: PageProps) {
  const { batch } = await props.params;
  const batchId = normalizeBatchSlug(batch);
  const meta = getBatchMeta(batchId);

  if (!meta) {
    notFound();
  }

  const [questions, subjects] = await Promise.all([
    getQuestionsForBatch(batchId),
    getSubjects().catch(() => []),
  ]);

  // Schema.org Article / Educational Course Structured Data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${meta.labelBn} প্রিলিমিনারি প্রশ্ন ও সম্পূর্ণ সমাধান`,
    description: `${meta.labelBn} প্রিলিমিনারি পরীক্ষার সম্পূর্ণ প্রশ্নপত্র, সঠিক উত্তর ও সমাধান।`,
    url: `${SITE_URL}/bcs/${meta.id}`,
    author: {
      "@type": "Organization",
      name: "মেধাবী (Medhavi)",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "মেধাবী (Medhavi)",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
  };

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
        item: `${SITE_URL}/bcs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${meta.labelBn} প্রিলিমিনারি`,
        item: `${SITE_URL}/bcs/${meta.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <BatchQuestionsView
        batchId={meta.id}
        batchLabelBn={meta.labelBn}
        batchLabelEn={meta.labelEn}
        questions={questions}
        subjects={subjects}
      />
    </>
  );
}
