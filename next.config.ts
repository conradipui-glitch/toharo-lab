import type { NextConfig } from "next";

// GitHub Pages отдаёт сайт по подпути /<repo>/, свой домен — по корню.
// Путь задаётся переменной при сборке, чтобы код был один и тот же.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  // Полностью статическая сборка: на выходе только HTML/CSS/JS в out/.
  // На проде нет ни сервера Node, ни API — атаковать нечего.
  output: "export",

  // Каждая страница — папка с index.html, чтобы nginx отдавал её без правил переписывания.
  trailingSlash: true,

  // Оптимизатор картинок требует сервер, в статике он недоступен.
  images: { unoptimized: true },

  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  // Не генерировать AGENTS.md/CLAUDE.md при сборке — они ведутся вручную.
  agentRules: false,
};

export default nextConfig;
