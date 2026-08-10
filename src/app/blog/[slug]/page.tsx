import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getPost, getAllPosts, getPublishedSlugs } from "@/lib/posts";
import { PostCard } from "@/components/post-card";

export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — TOHARO LAB`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post || !post.published) notFound();

  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  const date = new Date(post.date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article>
      <div className="border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <Link
            href="/blog/"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
          >
            ← Все материалы
          </Link>

          <div className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            {post.category}
            <span className="text-line">/</span>
            {post.readTime}
          </div>

          <h1 className="mt-4 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.03em] md:text-[44px]">
            {post.title}
          </h1>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
            {post.excerpt}
          </p>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            {date}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="prose-post">
          <MDXRemote
            source={post.content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 pb-8">
          <div className="mb-6 border-b border-line pb-3">
            <h2 className="font-display text-[24px] font-bold tracking-[-0.03em]">
              Читать дальше
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
