import { SiteHeader } from "@/components/SiteHeader";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main className="not-found page-frame">
        <span className="error-code">404</span>
        <h1>这项内容不在这里。</h1>
        <p>它可能被移动、改名，或者还没有发布。</p>
        <Link className="button button-primary" href="/posts">浏览全部内容</Link>
      </main>
    </div>
  );
}
