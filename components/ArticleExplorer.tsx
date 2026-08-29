"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { SiteHeader } from "@/components/SiteHeader";
import type { ArticleSummary } from "@/lib/articles";

export function ArticleExplorer({ articles }: { articles: ArticleSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    if (!keyword) return articles;

    return articles.filter((article) => {
      const searchable = [article.title, article.dek, ...article.tags].join(" ").toLocaleLowerCase();
      return searchable.includes(keyword);
    });
  }, [articles, query]);

  return (
    <>
      <SiteHeader active="articles" />

      <main className="archive-page page-frame">
        <header className="archive-heading">
          <div className="archive-heading-copy">
            <h1>Archive</h1>
          </div>

          <label className="post-search">
            <span className="post-search-icon" aria-hidden="true">✦</span>
            <span className="visually-hidden">Search posts</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("");
              }}
              placeholder="Search the archive"
              type="search"
              value={query}
            />
          </label>
        </header>

        <section className="archive-content" aria-label="Posts">
          <p aria-live="polite" className="visually-hidden">{filtered.length} posts</p>

          {filtered.length ? (
            <div className="article-card-list">
              {filtered.map((article) => (
                <ArticleCard article={article} headingLevel="h2" key={article.slug} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>{query ? "No matching posts" : "No posts yet"}</strong>
              <p>{query ? "Try another title, summary or topic." : "Published MDX files will appear here."}</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
