import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main className="not-found page-frame">
        <span className="overline">404 / NOT FOUND</span>
        <h1>这篇文章不在这里。</h1>
        <p>它可能被移动、改名，或者还没有发布。</p>
        <Link className="button button-primary" href="/posts">浏览全部文章</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
