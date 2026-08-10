export const CATEGORIES = ["Статья", "Гайд", "Заметка"] as const;
export type Category = (typeof CATEGORIES)[number];

/** URL-сегмент для каждой рубрики: /category/<slug>/ */
export const CATEGORY_SLUGS: Record<Category, string> = {
  Статья: "statyi",
  Гайд: "gaidy",
  Заметка: "zametki",
};

/** Заголовок страницы рубрики (множественное число). */
export const CATEGORY_TITLES: Record<Category, string> = {
  Статья: "Статьи",
  Гайд: "Гайды",
  Заметка: "Заметки",
};

export function categoryFromSlug(slug: string): Category | null {
  const found = (Object.keys(CATEGORY_SLUGS) as Category[]).find(
    (c) => CATEGORY_SLUGS[c] === slug
  );
  return found ?? null;
}

export type PostFrontmatter = {
  title: string;
  excerpt: string;
  category: Category;
  readTime: string;
  /** Путь вида /covers/<slug>.jpg. Пусто — покажется градиентная заглушка. */
  cover?: string;
  /** Описание картинки: читают скринридеры и поисковые системы. */
  coverAlt?: string;
  date: string;
  published: boolean;
  /** Канонический URL, если материал был опубликован где-то ещё раньше. */
  canonical?: string;
  /** Теги — попадают в JSON-LD и помогают AI-поиску понять тему. */
  tags?: string[];
  /** Дата существенного обновления материала, ГГГГ-ММ-ДД. */
  updated?: string;
};

export type Post = PostFrontmatter & {
  slug: string;
  content: string;
};

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
