type TocItem = {
  id: string;
  label: string;
};

export function ArticleToc({ items }: { items: TocItem[] }) {
  return (
    <details
      aria-label="文章目录"
      className="article-toc"
    >
      <summary className="article-toc-header" title="展开或收起阅读目录">
        <span className="article-toc-title">Contents</span>
        <span className="article-toc-controls" aria-hidden="true">
          <span className="article-toc-grip" />
          <span className="article-toc-toggle">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m14 6-6 6 6 6" className="article-toc-chevron" />
            </svg>
          </span>
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
        <span>Back to top</span>
        <span aria-hidden="true">↑</span>
      </a>
    </details>
  );
}
