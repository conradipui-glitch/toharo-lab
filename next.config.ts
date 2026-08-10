import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Полностью статическая сборка: на выходе только HTML/CSS/JS в out/.
  // На проде нет ни сервера Node, ни API — атаковать нечего.
  output: "export",

  // Каждая страница — папка с index.html, чтобы nginx отдавал её без правил переписывания.
  trailingSlash: true,

  // Оптимизатор картинок требует сервер, в статике он недоступен.
  images: { unoptimized: true },

  // Не генерировать AGENTS.md/CLAUDE.md при сборке — они ведутся вручную.
  agentRules: false,
};

export default nextConfig;
