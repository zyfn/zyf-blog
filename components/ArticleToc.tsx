type TocItem = {
  id: string;
  label: string;
};

export function ArticleToc({ items }: { items: TocItem[] }) {
  return (
    <aside
      aria-label="文章目录"
      className="article-toc"
      data-open="false"
    >
      <div className="article-toc-header">
        <span className="article-toc-title">Contents</span>
        <span className="article-toc-controls">
          <span className="article-toc-grip" aria-hidden="true" />
          <button aria-expanded="false" aria-label="展开目录" className="article-toc-toggle" type="button">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m14 6-6 6 6 6" className="article-toc-chevron" />
            </svg>
          </button>
        </span>
      </div>
      <div className="article-toc-body">
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
      </div>
    </aside>
  );
}
