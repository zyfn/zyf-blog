import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-frame footer-inner">
        <div>
          <Link className="brand brand-footer" href="/">NOTES<span>.</span></Link>
          <p>文章、教程与长期笔记。</p>
        </div>
        <nav aria-label="页脚导航">
          <Link href="/posts">全部文章</Link>
          <Link href="/write">写文章</Link>
          <a href="#top">回到顶部 ↑</a>
        </nav>
        <p className="copyright">保持好奇，持续写作。</p>
      </div>
    </footer>
  );
}
