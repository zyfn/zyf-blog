import { articles, getArticle, type Article, type ArticleSummary } from "./articles";
import type { StoredPost } from "./blog-db";

function dateLabel(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(timestamp))
    .replaceAll("/", ".");
}

function readingTime(content: string) {
  const compactLength = content.replace(/\s/g, "").length;
  return `${Math.max(2, Math.ceil(compactLength / 500))} 分钟`;
}

function mapStoredPost(post: StoredPost): Article {
  return {
    slug: post.slug,
    title: post.title,
    dek: post.excerpt,
    format: post.format,
    topic: post.topic,
    tags: post.tags,
    updated: dateLabel(post.updatedAt),
    readTime: readingTime(post.content),
    tone: post.tone,
    featured: false,
    body: post.content,
    storedId: post.id,
  };
}

export function toSummary(article: Article): ArticleSummary {
  return {
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    format: article.format,
    topic: article.topic,
    tags: article.tags,
    updated: article.updated,
    readTime: article.readTime,
    tone: article.tone,
    featured: article.featured,
    storedId: article.storedId,
  };
}

export async function listBlogPosts(): Promise<Article[]> {
  try {
    const { listStoredPosts } = await import("./blog-db");
    const stored = await listStoredPosts();
    const staticSlugs = new Set(stored.map((post: StoredPost) => post.slug));
    return [
      ...stored.map(mapStoredPost),
      ...articles.filter((article) => !staticSlugs.has(article.slug)),
    ];
  } catch {
    return articles;
  }
}

export async function getBlogPost(slug: string) {
  try {
    const { getStoredPost } = await import("./blog-db");
    const stored = await getStoredPost(slug);
    if (stored) return mapStoredPost(stored);
  } catch {
    // Static articles remain available when the local binding is not ready.
  }
  return getArticle(slug);
}
