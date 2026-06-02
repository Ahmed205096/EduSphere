import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_HOST ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/instructor/", "/student/", "/quiz/student"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
