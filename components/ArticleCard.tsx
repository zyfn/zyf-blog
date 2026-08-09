import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles";

type ArticleCardProps = {
  article: ArticleSummary;
  ordinal?: string;
  compact?: boolean;
};

export function ArticleCard({ article, ordinal = "01", compact }: ArticleCardProps) {
  return (
    <article className={`post-card${compact ? " post-card-compact" : ""}`}>
      <div className="post-card-meta">
        <span>{ordinal}</span>
        <span>{article.updated}</span>
      </div>
      <div className="post-card-content">
        <div className="post-kicker">
          <span>{article.topic}</span>
          <span>{article.format}</span>
          <span>{article.readTime}</span>
        </div>
        <h2>
          <Link href={`/posts/${article.slug}`}>{article.title}</Link>
        </h2>
        <p>{article.dek}</p>
        <div className="tag-list" aria-label="文章标签">
          {article.tags.slice(0, 4).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
      <Link className="post-card-arrow" href={`/posts/${article.slug}`} aria-label={`阅读：${article.title}`}>
        ↗
      </Link>
    </article>
  );
}
