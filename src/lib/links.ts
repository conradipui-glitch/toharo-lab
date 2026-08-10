import "server-only";
import fs from "fs";
import path from "path";

export type PartnerLink = {
  url: string;
  label: string;
  sponsored?: boolean;
  note?: string;
};

const LINKS_FILE = path.join(process.cwd(), "content", "links.json");

let cache: Record<string, PartnerLink> | null = null;

export function getLinks(): Record<string, PartnerLink> {
  if (cache) return cache;
  if (!fs.existsSync(LINKS_FILE)) return (cache = {});

  const parsed = JSON.parse(fs.readFileSync(LINKS_FILE, "utf-8"));
  const links: Record<string, PartnerLink> = parsed.links ?? {};

  for (const [id, link] of Object.entries(links)) {
    if (!/^[a-z0-9-]+$/.test(id))
      throw new Error(
        `content/links.json: id "${id}" должен быть из латиницы, цифр и дефисов — он попадает в URL /go/${id}/`
      );
    if (!/^https:\/\//.test(link.url))
      throw new Error(
        `content/links.json: ссылка "${id}" должна начинаться с https:// (сейчас ${link.url})`
      );
  }

  return (cache = links);
}

export function getLink(id: string): PartnerLink | null {
  return getLinks()[id] ?? null;
}

export function getLinkIds(): string[] {
  return Object.keys(getLinks());
}
