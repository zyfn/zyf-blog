import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-frame header-inner">
        <Link className="brand" href="/" aria-label="NOTES 首页">
          NOTES<span>.</span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          <Link href="/">首页</Link>
          <Link href="/posts">文章</Link>
          <Link href="/#topics">专题</Link>
          <Link className="write-link" href="/write">写文章</Link>
        </nav>
      </div>
    </header>
  );
}
