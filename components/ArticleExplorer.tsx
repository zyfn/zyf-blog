"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "./ArticleCard";
import type { ArticleSummary } from "@/lib/articles";

export function ArticleExplorer({
  articles,
  initialTopic,
}: {
  articles: ArticleSummary[];
  initialTopic?: string;
}) {
  const topics = useMemo(
    () => ["全部", ...Array.from(new Set(articles.map((article) => article.topic)))],
    [articles],
  );
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState(() =>
    initialTopic && articles.some((article) => article.topic === initialTopic)
      ? initialTopic
      : "全部",
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return articles.filter((article) => {
      const matchesTopic = activeTopic === "全部" || article.topic === activeTopic;
      const haystack = [article.title, article.dek, article.format, ...article.tags]
        .join(" ")
        .toLocaleLowerCase("zh-CN");
      return matchesTopic && (!normalized || haystack.includes(normalized));
    });
  }, [activeTopic, articles, query]);

  return (
    <div className="explorer">
      <div className="explorer-tools">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">搜索文章</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索文章、主题或标签"
            type="search"
            value={query}
          />
        </label>
        <div className="filter-list" aria-label="按专题筛选">
          {topics.map((topic) => (
            <button
              aria-pressed={activeTopic === topic}
              className={activeTopic === topic ? "is-active" : ""}
              key={topic}
              onClick={() => setActiveTopic(topic)}
              type="button"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      <p className="result-count">共 {filtered.length} 篇</p>
      {filtered.length ? (
        <div className="post-list">
          {filtered.map((article, index) => (
            <ArticleCard
              article={article}
              compact
              key={article.slug}
              ordinal={String(index + 1).padStart(2, "0")}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>没有找到匹配文章</strong>
          <p>换一个关键词，或切回“全部”。</p>
        </div>
      )}
    </div>
  );
}
