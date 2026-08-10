/**
 * Настройки сайта.
 *
 * Сайт собирается под два адреса одной и той же командой:
 *  - GitHub Pages — подпуть /toharo-lab/, для превью;
 *  - свой домен — корень, для прода.
 *
 * Разница задаётся переменными окружения при сборке, а не правкой кода:
 *   BASE_PATH=/toharo-lab SITE_URL=https://conradipui-glitch.github.io/toharo-lab
 * Без переменных собирается вариант для своего домена.
 */

/** Подпуть, на котором лежит сайт. Пусто для корня домена. */
export const BASE_PATH = process.env.BASE_PATH ?? "";

export const SITE = {
  name: "TOHARO LAB",
  url: process.env.SITE_URL ?? "https://toharo.space",
  author: "toharo",
  description:
    "Личная лаборатория про вайб-кодинг, AI-агентов и автоматизацию: практика, разборы и живые заметки без воды.",
  email: "hi@toharo.space",
  locale: "ru_RU",
} as const;

/**
 * Добавляет базовый путь к ссылке на файл или страницу.
 *
 * Нужно только там, где мы пишем обычные <img src> и <a href>: их Next
 * не префиксует сам, в отличие от <Link> и next/image.
 */
export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
