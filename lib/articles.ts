import GithubSlugger from "github-slugger";

export type Article = {
  slug: string;
  title: string;
  dek: string;
  tags: string[];
  published: string;
  updated: string;
  coverImage: string;
  createdAt: number;
  featured: boolean;
  body: string;
};

export type ArticleSummary = Omit<Article, "body">;

function plainHeading(value: string) {
  return value
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim();
}

export type TocItem = {
  id: string;
  label: string;
  depth: number;
};

export function getArticleToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  for (const match of markdown.matchAll(/^(#{2,6})\s+(.+)$/gm)) {
    const raw = match[2].trim();
    const id = slugger.slug(raw);
    const depth = match[1].length;
    if (depth <= 3) {
      items.push({ id, label: plainHeading(raw), depth });
    }
  }
  return items;
}
