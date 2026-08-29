"use client";

import { useState } from "react";

type TocItem = {
  id: string;
  label: string;
};

export function ArticleToc({ items }: { items: TocItem[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="文章目录"
      className="article-toc"
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className="article-toc-header">
        <span>阅读目录</span>
        <button
          aria-expanded={!collapsed}
          aria-label={collapsed ? "展开阅读目录" : "收起阅读目录"}
          className="article-toc-toggle"
          onClick={() => setCollapsed((value) => !value)}
          title={collapsed ? "展开阅读目录" : "收起阅读目录"}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M9 6h10M9 12h10M9 18h10" />
            <path d="m5 9-3 3 3 3" className="article-toc-chevron" />
          </svg>
        </button>
      </div>
      <nav>
        {items.map((item) => (
          <a href={`#${item.id}`} key={item.id}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="article-toc-top" href="#top">
        <span>返回顶部</span>
        <span aria-hidden="true">↑</span>
      </a>
    </aside>
  );
}
