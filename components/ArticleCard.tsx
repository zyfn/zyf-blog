import type { ArticleSummary } from "@/lib/articles";

type ArticleCardProps = {
  article: ArticleSummary;
  headingLevel?: "h2" | "h3";
};

export function ArticleCard({ article, headingLevel = "h3" }: ArticleCardProps) {
  const Heading = headingLevel;

  return (
    <article className="article-card-row">
      <a className="article-card-link" href={`/posts/${article.slug}`}>
        <time className="article-card-meta" dateTime={article.updated.replaceAll(".", "-")}>
          {article.updated}
        </time>
        <div className="article-card-copy">
          <Heading>{article.title}</Heading>
          <span className="article-card-summary">{article.dek}</span>
          {article.tags.length ? (
            <div className="article-card-tags" aria-label="Topics">
              {article.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : null}
        </div>
        <span className="article-card-arrow" aria-hidden="true">↗</span>
      </a>
    </article>
  );
}
