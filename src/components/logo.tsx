import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-block leading-[0.85] font-display font-extrabold tracking-[-0.04em]">
      <span className={`block text-[19px] ${dark ? "text-bg" : "text-ink"}`}>
        toharo
      </span>
      <span className="block text-[19px] text-ink-soft">lab</span>
    </Link>
  );
}
