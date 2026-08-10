import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  CATEGORY_TITLES,
  type Category,
} from "@/lib/post-schema";

const base =
  "rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors";
const active = "border-ink bg-ink text-bg";
const idle = "border-line text-ink-soft hover:border-ink hover:text-ink";

export function CategoryFilter({ current }: { current?: Category }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/blog/" className={`${base} ${!current ? active : idle}`}>
        Все
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/category/${CATEGORY_SLUGS[cat]}/`}
          className={`${base} ${current === cat ? active : idle}`}
        >
          {CATEGORY_TITLES[cat]}
        </Link>
      ))}
    </div>
  );
}
