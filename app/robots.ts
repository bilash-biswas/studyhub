import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/results/"],
    },
    sitemap: "https://studyhub.vercel.app/sitemap.xml",
  };
}
