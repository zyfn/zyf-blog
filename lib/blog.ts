import type { ComponentType, ElementType } from "react";
import { parse as parseYaml } from "yaml";
import type { Article, ArticleSummary } from "./articles";

type Frontmatter = {
  title?: unknown;
  date?: unknown;
  lastmod?: unknown;
  tags?: unknown;
  keywords?: unknown;
  summary?: unknown;
  description?: unknown;
  cover?: unknown;
  coverImage?: unknown;
  featured?: unknown;
  draft?: unknown;
  slug?: unknown;
};

const postSources = import.meta.glob("../content/posts/**/*.{md,mdx}", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

export type MdxContent = ComponentType<{ components?: Record<string, ElementType> }>;
type MdxModule = { default: MdxContent };

const postModules = import.meta.glob("../content/posts/**/*.{md,mdx}", {
  eager: true,
}) as Record<string, MdxModule>;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function tags(value: unknown) {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,，]/)
      : [];

  return [...new Set(values.map(text).filter(Boolean))];
}

function timestamp(value: unknown) {
  const parsed = value instanceof Date ? value.getTime() : Date.parse(text(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateLabel(value: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value)).replaceAll("/", ".");
}

function slugFromPath(path: string) {
  return path.split("/").at(-1)?.replace(/\.(md|mdx)$/i, "") ?? "article";
}

function parseDocument(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { data: {} as Frontmatter, content: source };
  const parsed = parseYaml(match[1]);
  return {
    data: parsed && typeof parsed === "object" ? parsed as Frontmatter : {} as Frontmatter,
    content: source.slice(match[0].length),
  };
}

function toArticle(path: string, source: string): Article | undefined {
  const parsed = parseDocument(source);
  const data = parsed.data;
  if (data.draft === true && process.env.NODE_ENV === "production") return undefined;

  const createdAt = timestamp(data.date) || Date.now();
  const updatedAt = timestamp(data.lastmod) || createdAt;
  const title = text(data.title);
  if (!title) return undefined;

  return {
    slug: text(data.slug) || slugFromPath(path),
    title,
    dek: text(data.summary) || text(data.description),
    tags: tags(data.tags ?? data.keywords),
    published: dateLabel(createdAt),
    updated: dateLabel(updatedAt),
    coverImage: text(data.cover) || text(data.coverImage),
    createdAt,
    featured: data.featured === true,
    body: parsed.content,
  };
}

function articleEntries() {
  return Object.entries(postSources)
    .map(([path, source]) => ({ path, article: toArticle(path, source) }))
    .filter((entry): entry is { path: string; article: Article } => Boolean(entry.article))
    .sort((left, right) => right.article.createdAt - left.article.createdAt);
}

function allArticles() {
  return articleEntries().map((entry) => entry.article);
}

export function toSummary(article: Article): ArticleSummary {
  return {
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    tags: article.tags,
    published: article.published,
    updated: article.updated,
    coverImage: article.coverImage,
    createdAt: article.createdAt,
    featured: article.featured,
  };
}

export async function listBlogPosts(): Promise<Article[]> {
  return allArticles();
}

export async function getBlogPost(slug: string) {
  const entry = articleEntries().find(({ article }) => article.slug === slug);
  if (!entry) return undefined;
  const Content = postModules[entry.path]?.default;
  if (!Content) return undefined;
  return { ...entry.article, Content };
}
