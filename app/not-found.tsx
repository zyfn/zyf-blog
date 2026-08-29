import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main className="not-found page-frame">
        <span className="error-code">404</span>
        <h1>这项内容不在这里。</h1>
        <p>它可能被移动、改名，或者还没有发布。</p>
        <a className="button button-primary" href="/posts">浏览全部内容</a>
      </main>
    </div>
  );
}
