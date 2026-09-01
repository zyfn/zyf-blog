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

export function getArticleToc(markdown: string) {
  const slugger = new GithubSlugger();
  return Array.from(markdown.matchAll(/^##\s+(.+)$/gm)).map((match) => {
    const label = plainHeading(match[1]);
    return { id: slugger.slug(label), label };
  });
}
