import Link from "next/link";
import { SITE, asset } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-bg-raised">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-display text-[19px] font-extrabold leading-[0.85] tracking-[-0.04em]">
              <span className="block">toharo</span>
              <span className="block text-ink-soft">lab</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              Личная лаборатория про вайб-кодинг и AI-агентов. Практика,
              разборы и заметки о том, что реально работает — и что нет.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              Разделы
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/category/gaidy/" className="hover:underline">
                  Гайды
                </Link>
              </li>
              <li>
                <Link href="/category/statyi/" className="hover:underline">
                  Статьи
                </Link>
              </li>
              <li>
                <Link href="/category/zametki/" className="hover:underline">
                  Заметки
                </Link>
              </li>
              <li>
                <Link href="/blog/" className="hover:underline">
                  Все материалы
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              Проект
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about/" className="hover:underline">
                  О проекте
                </Link>
              </li>
              <li>
                <a
                  href={SITE.telegram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Телеграм {SITE.telegram.handle}
                </a>
              </li>
              <li>
                <a
                  href={asset("/feed.xml")}
                  rel="alternate"
                  type="application/rss+xml"
                  className="hover:underline"
                >
                  RSS-лента
                </a>
              </li>
            </ul>

            {/* Со своего экрана QR не отсканируешь — на телефоне он не нужен */}
            <div className="mt-5 hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element -- статический экспорт */}
              <img
                src={asset(SITE.telegram.qr)}
                alt={`QR-код со ссылкой на телеграм ${SITE.telegram.handle}`}
                width={96}
                height={96}
                className="rounded-lg border border-line bg-bg-raised p-1.5"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 TOHARO LAB</span>
          <span>Собрано вручную. И немного агентами.</span>
        </div>
      </div>
    </footer>
  );
}
