import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/post-schema";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const latest = posts[0]?.updated ?? posts[0]?.date ?? new Date().toISOString();

  return [
    { url: `${SITE.url}/`, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/blog/`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/about/`, changeFrequency: "yearly", priority: 0.3 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE.url}/category/${CATEGORY_SLUGS[c]}/`,
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${SITE.url}/blog/${p.slug}/`,
      lastModified: p.updated ?? p.date,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
