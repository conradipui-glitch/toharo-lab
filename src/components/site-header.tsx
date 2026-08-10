import Link from "next/link";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";

export const NAV = [
  { href: "/", label: "Главная" },
  { href: "/category/gaidy/", label: "Гайды" },
  { href: "/category/statyi/", label: "Статьи" },
  { href: "/category/zametki/", label: "Заметки" },
  { href: "/about/", label: "О проекте" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/about/#contact"
            className="group flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-bg transition-colors hover:bg-accent hover:text-ink"
          >
            Связаться
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}
