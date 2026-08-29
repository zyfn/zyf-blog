/* eslint-disable @next/next/no-img-element -- vinext's next/image shim breaks React hooks during hydration. */
import type { ArticleSummary } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { TypewriterLine } from "@/components/TypewriterLine";

export function BlogHome({ articles }: { articles: ArticleSummary[] }) {
  const latestArticles = articles.slice(0, 5);

  return (
    <>
      <SiteHeader />

      <main className="curated-home page-frame">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <h1 id="home-title">Hi, I&apos;m <span className="home-script-name">ZYF</span><span className="home-wave" aria-hidden="true">👋</span></h1>
            <p className="home-hero-role">Agent Infra Engineer In Alibaba</p>
            <p className="home-hero-focus">Working across <TypewriterLine /></p>
            <div className="home-hero-actions">
              <a className="home-primary-link" href="/about">About <span aria-hidden="true">→</span></a>
              <a href="/posts">Blog <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <div className="home-profile" aria-label="ZYF 个人标识">
            <span className="home-profile-ring" aria-hidden="true" />
            <div className="home-profile-avatar-frame">
              <img className="home-profile-avatar" src="/images/profile/zyf.jpg" alt="ZYF" />
            </div>
          </div>
        </section>

        <section className="home-latest" aria-labelledby="latest-title">
          <header className="home-section-heading">
            <h2 id="latest-title">Latest Updates</h2>
            <a href="/posts">View All <span aria-hidden="true">→</span></a>
          </header>

          {latestArticles.length ? (
            <div className="home-latest-list">
              {latestArticles.map((article) => (
                <article className="home-latest-row" key={article.slug}>
                  <a className="home-latest-image" href={`/posts/${article.slug}`} tabIndex={-1} aria-hidden="true">
                    {article.coverImage ? <img alt="" loading="lazy" src={article.coverImage} /> : <span />}
                  </a>
                  <a className="home-latest-main" href={`/posts/${article.slug}`}>
                    <time className="home-latest-meta">{article.updated}</time>
                    <h3>{article.title}</h3>
                    <p>{article.dek}</p>
                  </a>
                  <span className="home-latest-arrow" aria-hidden="true">→</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="home-latest-empty">New posts will appear here in publishing order.</div>
          )}
        </section>

      </main>
    </>
  );
}
