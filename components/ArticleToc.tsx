type TocItem = {
  id: string;
  label: string;
};

export function ArticleToc({ items }: { items: TocItem[] }) {
  return (
    <details
      aria-label="文章目录"
      className="article-toc"
      open
    >
      <summary className="article-toc-header" title="展开或收起阅读目录">
        <span>阅读目录</span>
        <span className="article-toc-toggle" aria-hidden="true">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M9 6h10M9 12h10M9 18h10" />
            <path d="m5 9-3 3 3 3" className="article-toc-chevron" />
          </svg>
        </span>
      </summary>
      <nav>
        {items.map((item, index) => (
          <a aria-current={index === 0 ? "location" : undefined} href={`#${item.id}`} key={item.id}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="article-toc-top" href="#top">
        <span>返回顶部</span>
        <span aria-hidden="true">↑</span>
      </a>
    </details>
  );
}
