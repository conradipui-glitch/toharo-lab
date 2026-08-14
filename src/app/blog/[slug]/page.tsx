import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getPost, getAllPosts, getPublishedSlugs } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { CoverImage } from "@/components/cover-image";
import { mdxComponents } from "@/components/mdx-components";
import { TableOfContents, extractHeadings } from "@/components/table-of-contents";
import { PostEnd } from "@/components/post-end";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `${SITE.url}/blog/${post.slug}/`;
  const image = post.cover ? `${SITE.url}${post.cover}` : undefined;

  return {
    // Без имени сайта: его добавит шаблон title в корневом layout
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: post.canonical ?? url },
    keywords: post.tags,
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: SITE.name,
      locale: "ru_RU",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: image ? [{ url: image, width: 1600, height: 900 }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: image ? [image] : undefined,
    },
  };
}

/**
 * Связанные материалы: сначала той же рубрики, затем общие теги, затем
 * просто свежие. До 3 штук, без текущего поста.
 */
function getRelated(slug: string) {
  const all = getAllPosts().filter((p) => p.slug !== slug);
  const current = getPost(slug);
  const currentTags = new Set(current?.tags ?? []);

  const sameCategory = all.filter((p) => p.category === current?.category);
  const sameTags = all.filter(
    (p) =>
      p.category !== current?.category &&
      (p.tags ?? []).some((t) => currentTags.has(t))
  );
  const rest = all.filter(
    (p) => p.category !== current?.category && !sameTags.includes(p)
  );

  const picked: typeof all = [];
  const seen = new Set<string>();
  for (const p of [...sameCategory, ...sameTags, ...rest]) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    picked.push(p);
    if (picked.length === 3) break;
  }
  return picked;
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post || !post.published) notFound();

  const related = getRelated(slug);
  const headings = extractHeadings(post.content);
  const url = `${SITE.url}/blog/${post.slug}/`;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // Article-разметка: по ней поисковики и AI-движки понимают, что это статья,
  // кто автор и когда она обновлялась.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: "ru-RU",
    author: { "@type": "Person", name: SITE.author },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: url,
    ...(post.cover ? { image: `${SITE.url}${post.cover}` } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        // JSON.stringify экранирует данные, XSS тут невозможен
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            {fmt(post.date)}
            {post.updated && post.updated !== post.date && (
              <> · обновлено {fmt(post.updated)}</>
            )}
          </div>
        </div>
      </div>

      {post.cover && (
        <div className="mx-auto max-w-4xl px-6 pt-10">
          <CoverImage
            src={post.cover}
            alt={post.coverAlt ?? post.title}
            priority
          />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-6 py-14">
        {/* Оглавление — компактный бокс сверху, на длинных материалах */}
        {headings.length >= 3 && (
          <div className="mb-10">
            <TableOfContents items={headings} />
          </div>
        )}

        <div className="prose-post">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <PostEnd url={url} title={post.title} />
      </div>

      {related.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 pb-16">
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
