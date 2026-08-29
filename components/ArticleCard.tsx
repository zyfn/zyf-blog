/* eslint-disable @next/next/no-img-element -- vinext's next/image shim breaks React hooks during hydration. */
import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles";

type ArticleCardProps = {
  article: ArticleSummary;
  headingLevel?: "h2" | "h3";
};

export function ArticleCard({ article, headingLevel = "h3" }: ArticleCardProps) {
  const Heading = headingLevel;

  return (
    <article className="article-card-row">
      <Link className="article-card-link" href={`/posts/${article.slug}`}>
        <span className="article-card-image" aria-hidden="true">
          {article.coverImage ? <img alt="" loading="lazy" src={article.coverImage} /> : <span />}
        </span>
        <div className="article-card-copy">
          <div className="article-card-meta">
            <time>{article.updated}</time>
          </div>
          <Heading>{article.title}</Heading>
          <span className="article-card-summary">{article.dek}</span>
          {article.tags.length ? (
            <div className="article-card-tags" aria-label="Topics">
              {article.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
