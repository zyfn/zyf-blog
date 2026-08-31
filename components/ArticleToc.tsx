type TocItem = {
  id: string;
  label: string;
};

export function ArticleToc({ items }: { items: TocItem[] }) {
  return (
    <aside
      aria-label="文章目录"
      className="article-toc"
      data-open="true"
      suppressHydrationWarning
    >
      <button
        aria-controls="article-toc-body"
        aria-expanded="true"
        aria-label="收起目录"
        className="article-toc-header"
        suppressHydrationWarning
        type="button"
      >
        <span className="article-toc-title">目录</span>
        <span className="article-toc-caret" aria-hidden="true" />
      </button>
      <div className="article-toc-body" id="article-toc-body">
        <nav>
          {items.map((item, index) => (
            <a aria-current={index === 0 ? "location" : undefined} href={`#${item.id}`} key={item.id} suppressHydrationWarning>
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
