import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { CategoryFilter } from "@/components/category-filter";

export const metadata = {
  title: "Материалы — TOHARO LAB",
  description: "Гайды, статьи и заметки о вайб-кодинге и AI-агентах.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-[38px] font-bold tracking-[-0.035em]">
        Все материалы
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Практика по AI-агентам и вайб-кодингу: что собрано, что сломалось и что
        из этого стоит повторять.
      </p>

      <div className="mt-8">
        <CategoryFilter />
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
