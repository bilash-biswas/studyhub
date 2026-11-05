import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/results/", "/api/"],
    },
    sitemap: [
      "https://medhavi-nine.vercel.app/sitemap.xml",
      "https://medhavi-nine.vercel.app/questions/sitemap.xml",
    ],
  };
}
