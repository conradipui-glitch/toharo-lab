import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { asset } from "@/lib/site";
import { PoolChart, ModelVersions } from "@/components/pool-interactive";
import { BenchChart } from "@/components/bench-interactive";
import { headingSlug } from "@/components/table-of-contents";

/**
 * Компоненты, доступные внутри текста поста.
 * Обычный Markdown работает как есть; это добавка для того, что разметкой не выразить.
 */

/** Заголовки получают id по транслиту текста — на них ссылается оглавление. */
function headingId(children: unknown): string | undefined {
  if (Array.isArray(children)) {
    const text = children
      .map((c) => (typeof c === "string" ? c : ""))
      .join("");
    return headingSlug(text);
  }
  if (typeof children === "string") return headingSlug(children);
  return undefined;
}

function H2({ children }: { children?: React.ReactNode }) {
  const id = headingId(children);
  return <h2 id={id}>{children}</h2>;
}

function H3({ children }: { children?: React.ReactNode }) {
  const id = headingId(children);
  return <h3 id={id}>{children}</h3>;
}

/**
 * Партнёрская или просто внешняя ссылка по id из content/links.json.
 *
 *   <Partner id="cursor">Cursor</Partner>
 *
 * Ведёт на /go/<id>/, поэтому клик попадает в статистику,
 * а URL меняется в одном месте.
 */
function Partner({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={asset(`/go/${id}/`)}
      rel="sponsored noopener nofollow"
      target="_blank"
      data-partner={id}
    >
      {children}
    </a>
  );
}

/**
 * Раскрытие партнёрских отношений. Обязателен в любом посте,
 * где есть <Partner> с sponsored — это проверяет npm run check.
 */
function Disclosure({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-xl border border-line bg-bg-raised p-4 text-[13px] leading-relaxed text-ink-soft not-italic">
      <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em]">
        Раскрытие
      </span>
      {children ?? (
        <>
          В материале есть партнёрские ссылки: если вы перейдёте по ним и
          оформите подписку, я могу получить комиссию. На выбор инструментов и
          оценки в тексте это не влияет — пишу только о том, чем пользуюсь сам.
        </>
      )}
    </aside>
  );
}

/** Врезка с замечанием по ходу текста. */
function Note({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <aside className="my-6 rounded-xl border-l-[3px] border-accent bg-bg-raised px-4 py-3 text-[15px] leading-relaxed">
      {title && (
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
          {title}
        </div>
      )}
      {children}
    </aside>
  );
}

/**
 * Короткий ответ в самом начале статьи — 2–4 предложения.
 * Именно этот блок AI-поиск чаще всего цитирует, поэтому он должен
 * отвечать на вопрос заголовка целиком и без отсылок к остальному тексту.
 */
function Answer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mb-8 rounded-xl border border-ink/15 bg-bg-raised p-5 text-[16px] leading-relaxed">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        Коротко
      </div>
      {children}
    </div>
  );
}

/** Внутренняя ссылка на другой материал сайта. */
function Post({ slug, children }: { slug: string; children?: React.ReactNode }) {
  return <Link href={`/blog/${slug}/`}>{children}</Link>;
}

export const mdxComponents: MDXComponents = {
  h2: H2,
  h3: H3,
  Partner,
  Disclosure,
  Note,
  Answer,
  Post,
  PoolChart,
  ModelVersions,
  BenchChart,
};
