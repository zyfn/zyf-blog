"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import type { ArticleSummary } from "@/lib/articles";

const TOPIC_TONES = ["coral", "blue", "sage", "violet"] as const;

function topicTone(tag: string) {
  const hash = [...tag].reduce((value, character) => (value * 31 + (character.codePointAt(0) ?? 0)) >>> 0, 0);
  return `topic-tone-${TOPIC_TONES[hash % TOPIC_TONES.length]}`;
}

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
            <div className="article-index">
              {filtered.map((article) => (
                <article className="article-index-row" key={article.slug}>
                  <a className="article-index-main" href={`/posts/${article.slug}`}>
                    <time className="article-index-date">{article.updated}</time>
                    <div className="article-index-copy">
                      <h2>{article.title}</h2>
                      {article.tags.length ? (
                        <div className="article-row-tags" aria-label="Topics">
                          {article.tags.map((tag) => <span className={topicTone(tag)} key={tag}>{tag}</span>)}
                        </div>
                      ) : null}
                      <p>{article.dek}</p>
                    </div>
                    <span className="article-index-arrow" aria-hidden="true">↗</span>
                  </a>
                </article>
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
