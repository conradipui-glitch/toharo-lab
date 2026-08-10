import Link from "next/link";
import type { Post } from "@/lib/post-schema";
import { CoverImage } from "./cover-image";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}/`}
      className="group flex flex-col rounded-2xl border border-line bg-bg-raised p-5 transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_12px_32px_-18px_rgba(20,20,15,0.45)]"
    >
      <CoverImage
        src={post.cover || undefined}
        alt={post.coverAlt ?? post.title}
        displayRatio="16 / 10"
        className="mb-4"
      />

      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        {post.category}
      </div>

      <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug tracking-[-0.015em] text-ink">
        {post.title}
      </h3>

      <p className="mt-2 line-clamp-4 flex-1 text-[13.5px] leading-relaxed text-ink-soft">
        {post.excerpt}
      </p>

      <div className="mt-4 font-mono text-[10px] tracking-wide text-ink-soft">
        {post.readTime}
      </div>
    </Link>
  );
}
