import type { TocItem } from "@/lib/articles";

type GroupNode = {
  head: TocItem;
  headIndex: number;
  children: { item: TocItem; index: number }[];
};

export function ArticleToc({ items }: { items: TocItem[] }) {
  const nodes: ({ type: "solo"; item: TocItem; index: number } | { type: "group"; group: GroupNode })[] = [];
  let openGroup: GroupNode | null = null;

  items.forEach((item, index) => {
    if (item.depth === 2) {
      openGroup = { head: item, headIndex: index, children: [] };
      nodes.push({ type: "group", group: openGroup });
    } else if (openGroup) {
      openGroup.children.push({ item, index });
    } else {
      nodes.push({ type: "solo", item, index });
    }
  });

  const renderLink = (item: TocItem, index: number) => (
    <a
      aria-current={index === 0 ? "location" : undefined}
      data-depth={item.depth}
      href={`#${item.id}`}
      key={item.id}
      suppressHydrationWarning
    >
      {item.label}
    </a>
  );

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
          {nodes.map((node) => {
            if (node.type === "solo") {
              return renderLink(node.item, node.index);
            }
            const { group } = node;
            return (
              <div className="article-toc-group" data-collapsed="false" key={group.head.id}>
                <div className="article-toc-group-head">
                  {group.children.length ? (
                    <button
                      aria-expanded="true"
                      aria-label={`收起「${group.head.label}」小节`}
                      className="article-toc-group-caret"
                      suppressHydrationWarning
                      type="button"
                    />
                  ) : (
                    <span aria-hidden="true" className="article-toc-caret-slot" />
                  )}
                  {renderLink(group.head, group.headIndex)}
                </div>
                {group.children.map((child) => renderLink(child.item, child.index))}
              </div>
            );
          })}
        </nav>
        <a aria-label="返回顶部" className="article-toc-top" href="#top">
          <span className="article-toc-top-icon" aria-hidden="true">↑</span>
        </a>
      </div>
    </aside>
  );
}
