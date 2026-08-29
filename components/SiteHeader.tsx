import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

type SiteSection = "articles" | "about";

export function SiteHeader({ active }: { active?: SiteSection }) {
  return (
    <header className="site-header">
      <div className="page-frame header-inner">
        <Link className="brand" href="/" aria-label="ZYF 首页">
          <SiteLogo />
        </Link>
        <nav className="site-global-nav" aria-label="主导航">
          <Link aria-current={active === "articles" ? "page" : undefined} href="/posts">Blog</Link>
          <Link aria-current={active === "about" ? "page" : undefined} href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
