"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Меню"
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-line"
      >
        <span
          className={`block h-[1.5px] w-4 bg-ink transition-transform ${
            open ? "translate-y-[3.25px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-[1.5px] w-4 bg-ink transition-transform ${
            open ? "-translate-y-[3.25px] -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-line bg-bg px-6 py-4">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
