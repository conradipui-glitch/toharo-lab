import Link from "next/link";

export const metadata = {
  title: "О проекте",
  description: "Кто ведёт TOHARO LAB и зачем этот проект существует.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        О проекте
      </div>

      <h1 className="mt-5 font-display text-[38px] font-bold leading-[1.1] tracking-[-0.035em]">
        Лаборатория, а не блог
      </h1>

      <div className="prose-post mt-8">
        <p>
          TOHARO LAB — место, где я разбираю AI-агентов и вайб-кодинг на
          практике. Не обзоры по пресс-релизам, а то, что я собрал сам,
          сломал сам и починил сам.
        </p>

        <h2>Что здесь есть</h2>
        <p>
          <strong>Гайды</strong> — пошаговые разборы: как собрать, настроить,
          запустить. С командами, которые можно скопировать.
        </p>
        <p>
          <strong>Статьи</strong> — разборы того, как всё это устроено и почему
          работает именно так.
        </p>
        <p>
          <strong>Заметки</strong> — короткие наблюдения из повседневной
          работы. Без структуры, зато по делу.
        </p>

        <h2>Принципы</h2>
        <ul>
          <li>Ничего не рекомендую, пока не прогнал на реальной задаче.</li>
          <li>Если инструмент не сработал — пишу и об этом тоже.</li>
          <li>Без «революций» и «game changer» в заголовках.</li>
        </ul>
      </div>

      <div
        id="contact"
        className="mt-14 rounded-2xl border border-line bg-bg-raised p-7 scroll-mt-24"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
          Контакты
        </div>
        <h2 className="mt-3 font-display text-[24px] font-bold tracking-[-0.03em]">
          Написать мне
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Есть вопрос по материалу, идея для разбора или предложение о
          сотрудничестве — пишите.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="mailto:hi@toharo.space"
            className="rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-bg transition-colors hover:bg-accent hover:text-ink"
          >
            hi@toharo.space
          </a>
          <Link
            href="/blog/"
            className="rounded-full border border-ink/20 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:border-ink"
          >
            К материалам
          </Link>
        </div>
      </div>
    </div>
  );
}
