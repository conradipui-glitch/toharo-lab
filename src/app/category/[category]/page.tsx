import { notFound } from "next/navigation";
import { getPostsByCategory } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { CategoryFilter } from "@/components/category-filter";
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  CATEGORY_TITLES,
  categoryFromSlug,
} from "@/lib/post-schema";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: CATEGORY_SLUGS[c] }));
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[category]">) {
  const { category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return {};
  return {
    title: `${CATEGORY_TITLES[category]} — TOHARO LAB`,
    description: `${CATEGORY_TITLES[category]} о вайб-кодинге и AI-агентах.`,
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/category/[category]">) {
  const { category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const posts = getPostsByCategory(category);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-[38px] font-bold tracking-[-0.035em]">
        {CATEGORY_TITLES[category]}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Практика по AI-агентам и вайб-кодингу: что собрано, что сломалось и что
        из этого стоит повторять.
      </p>

      <div className="mt-8">
        <CategoryFilter current={category} />
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Пока ничего нет
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
