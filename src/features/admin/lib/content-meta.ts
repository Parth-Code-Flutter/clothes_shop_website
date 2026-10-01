/** Storefront content shapes shared by the server data, the actions and the editors. */

export const HOME_SECTIONS = ["premiere", "intermission", "categories", "arrivals"] as const;
export type HomeSectionId = (typeof HOME_SECTIONS)[number];

export const HOME_SECTION_META: Record<HomeSectionId, { label: string; description: string }> = {
  premiere: { label: "Premiere opener", description: "Curtains, countdown and the product reel" },
  intermission: { label: "Intermission strip", description: "Crossed film strips listing each category" },
  categories: { label: "Categories", description: "One scene per category" },
  arrivals: { label: "New arrivals", description: "The latest pieces from the catalogue" },
};

export type AnnouncementMessage = { id: string; text: string; href: string };

export type SiteContent = {
  announcement: { enabled: boolean; messages: AnnouncementMessage[] };
  hero: {
    kicker: string;
    titleTop: string;
    titleBottom: string;
    starring: string;
    ctaLabel: string;
    ctaHref: string;
    finaleTitle: string;
    /** "mix" picks one piece per category; otherwise a collection id. */
    reelSource: string;
  };
  sections: { id: HomeSectionId; visible: boolean }[];
  footer: { headline: string; highlight: string; blurb: string; newsletter: string };
};

export const CONTENT_LIMITS = {
  messages: 6,
  message: 60,
  kicker: 40,
  title: 24,
  starring: 50,
  ctaLabel: 24,
  finaleTitle: 24,
  headline: 40,
  highlight: 30,
  blurb: 200,
  newsletter: 160,
} as const;

export const PAGE_STATUSES = ["published", "draft"] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export const PAGE_LIMITS = { title: 80, body: 20_000, seoTitle: 70, seoDescription: 160 } as const;

/** Internal paths ("/shop") or full https links. */
export function isValidLink(value: string) {
  return /^\/[a-z0-9\-/?=&#._]*$/i.test(value) || /^https:\/\/[^\s]+$/i.test(value);
}

export type Block = { kind: "h2" | "h3" | "p"; text: string } | { kind: "ul"; items: string[] };

/** A tiny subset of Markdown: ## and ### headings, "- " lists and paragraphs separated by blank lines. */
export function toBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of source.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((line) => line.trimEnd()).filter((line) => line.trim());
    if (lines.length === 0) continue;
    if (lines.every((line) => /^\s*[-*] /.test(line))) {
      blocks.push({ kind: "ul", items: lines.map((line) => line.replace(/^\s*[-*] /, "")) });
      continue;
    }
    let paragraph: string[] = [];
    const flush = () => {
      if (paragraph.length) blocks.push({ kind: "p", text: paragraph.join(" ") });
      paragraph = [];
    };
    for (const line of lines) {
      if (line.startsWith("### ")) {
        flush();
        blocks.push({ kind: "h3", text: line.slice(4) });
      } else if (line.startsWith("## ")) {
        flush();
        blocks.push({ kind: "h2", text: line.slice(3) });
      } else paragraph.push(line.trim());
    }
    flush();
  }
  return blocks;
}

export function wordCount(source: string) {
  return source.split(/\s+/).filter((word) => /\w/.test(word)).length;
}
