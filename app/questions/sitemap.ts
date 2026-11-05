import { MetadataRoute } from "next";
import { getQuestionsForSitemap } from "@/lib/services/question-service";

export const revalidate = 86400; // Revalidate question sitemap once every 24 hours

const BASE_URL = "https://medhavi-nine.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const questions = await getQuestionsForSitemap();

    return questions.map((q) => ({
      url: `${BASE_URL}/questions/${q.id}`,
      lastModified: q.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to generate questions sitemap:", error);
    return [];
  }
}
