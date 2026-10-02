import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/results/"],
    },
    sitemap: "https://medhavi-nine.vercel.app/sitemap.xml",
  };
}
