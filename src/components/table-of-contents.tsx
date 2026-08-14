export type TocItem = {
  slug: string;
  text: string;
  level: number;
};

/**
 * Достаёт заголовки h2/h3 из MDX-контента и превращает их в якоря.
 * Якорь = транслит от текста заголовка; mdx-components.tsx обязан добавить
 * тем же slug id на каждый h2/h3, иначе ссылки не сработают.
 */
export function extractHeadings(content: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const level = m[1].length;
    const text = m[2]
      .replace(/[`*_]/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .trim();
    if (!text) continue;
    items.push({ slug: headingSlug(text), text, level });
  }
  return items;
}

export function headingSlug(text: string): string {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return text
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Оглавление"
      className="rounded-2xl border border-line bg-bg-raised p-5"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        Содержание
      </div>
      <ol className="mt-3 space-y-2 border-l border-line pl-3">
        {items.map((item) => (
          <li
            key={item.slug}
            className={item.level === 3 ? "pl-4" : ""}
          >
            <a
              href={`#${item.slug}`}
              className="block text-[13px] leading-snug text-ink-soft transition-colors hover:text-ink"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
