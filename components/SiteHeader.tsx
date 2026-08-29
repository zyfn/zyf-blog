import { SiteLogo } from "@/components/SiteLogo";

type SiteSection = "articles" | "about";

export function SiteHeader({ active }: { active?: SiteSection }) {
  return (
    <header className="site-header">
      <div className="page-frame header-inner">
        <a className="brand" href="/" aria-label="ZYF 首页">
          <SiteLogo />
        </a>
        <nav className="site-global-nav" aria-label="主导航">
          <a aria-current={active === "articles" ? "page" : undefined} href="/posts">Blog</a>
          <a aria-current={active === "about" ? "page" : undefined} href="/about">About</a>
        </nav>
      </div>
    </header>
  );
}
