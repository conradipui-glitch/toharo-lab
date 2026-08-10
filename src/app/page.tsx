import Link from "next/link";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { CATEGORY_SLUGS } from "@/lib/post-schema";

function SectionHeading({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between border-b border-line pb-3">
      <h2 className="font-display text-[26px] font-bold tracking-[-0.03em]">
        {title}
      </h2>
      <Link
        href={href}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
      >
        Смотреть все →
      </Link>
    </div>
  );
}

export default function Home() {
  const all = getAllPosts();
  const guides = getPostsByCategory("Гайд").slice(0, 3);
  const articles = getPostsByCategory("Статья").slice(0, 3);
  const notes = getPostsByCategory("Заметка").slice(0, 3);

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Личная лаборатория
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-[40px] font-bold leading-[1.05] tracking-[-0.035em] md:text-[58px]">
            Вайб-кодинг и AI-агенты{" "}
            <span className="bg-accent px-2 py-0.5">без магии</span> и без воды
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Собираю агентов, ломаю их и рассказываю, что осталось работать.
            Практика, разборы инструментов и честные заметки о том, где всё это
            действительно экономит время.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/blog/"
              className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-bg transition-colors hover:bg-accent hover:text-ink"
            >
              Читать материалы
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/about/"
              className="rounded-full border border-ink/20 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink"
            >
              О проекте
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap gap-8 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            <div>
              <div className="font-display text-2xl font-bold tracking-normal text-ink">
                {all.length}
              </div>
              материалов
            </div>
            <div>
              <div className="font-display text-2xl font-bold tracking-normal text-ink">
                {guides.length > 0 ? getPostsByCategory("Гайд").length : 0}
              </div>
              гайдов
            </div>
            <div>
              <div className="font-display text-2xl font-bold tracking-normal text-ink">
                2026
              </div>
              актуально
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {articles.length > 0 && (
          <section className="mb-16">
            <SectionHeading title="Статьи" href={`/category/${CATEGORY_SLUGS["Статья"]}/`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {guides.length > 0 && (
          <section className="mb-16">
            <SectionHeading title="Гайды" href={`/category/${CATEGORY_SLUGS["Гайд"]}/`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {notes.length > 0 && (
          <section>
            <SectionHeading title="Заметки" href={`/category/${CATEGORY_SLUGS["Заметка"]}/`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
