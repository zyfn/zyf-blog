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
      <button
        aria-expanded="false"
        aria-label="展开目录"
        className="article-toc-header"
        type="button"
      >
        <span className="article-toc-title">Contents</span>
        <span className="article-toc-grip" aria-hidden="true" />
      </button>
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
