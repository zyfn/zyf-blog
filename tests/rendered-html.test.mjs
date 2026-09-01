import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: handler } = await import(workerUrl.href);

  return handler(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }));
}

test("server-renders the editorial home without database content", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>ZYF｜工程实践与长期记录<\/title>/i);
  assert.match(html, /ZYF/);
  assert.match(html, /Hi, I/);
  assert.match(html, /home-script-name[^>]*>ZYF/);
  assert.match(html, /Agent Infra Engineer In Alibaba/);
  assert.match(html, /Agent Runtime/);
  assert.match(html, /AI Open Platform/);
  assert.match(html, /MCP Gateway/);
  assert.match(html, /AgentTeam/);
  assert.match(html, /Latest Updates/);
  assert.match(html, />About <span[^>]*>→<\/span><\/a>/);
  assert.match(html, />Blog <span[^>]*>→<\/span><\/a>/);
  assert.match(html, /aria-label="主导航"/);
  assert.match(html, />Home<|>Blog<|>About</);
  assert.match(html, /images\/profile\/zyf\.jpg/);
  assert.doesNotMatch(html, /site-logo-wordmark|site-global-search|>首页</);
  assert.match(html, /href="\/posts"/);
  assert.match(html, /href="\/about"/);
  assert.equal((html.match(/class="article-card-row"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /ZYF Notes|全部标签|标签/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("uses repository MDX as the only publishing source", async () => {
  const [blogSource, explorerSource, homeSource, cardSource, headerSource, themeSource, tocSource, layoutSource, baseStyles, contentStyles, postPageSource, mdxSource, packageJson, readme] = await Promise.all([
    readFile(new URL("../lib/blog.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/ArticleExplorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/BlogHome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ArticleCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ThemeToggle.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ArticleToc.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/base.css", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/content.css", import.meta.url), "utf8"),
    readFile(new URL("../app/posts/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/MdxArticle.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(blogSource, /content\/posts/);
  assert.match(blogSource, /parseYaml/);
  assert.match(blogSource, /featured/);
  assert.match(blogSource, /data\.tags \?\? data\.keywords/);
  assert.doesNotMatch(blogSource, /readingTime|readTime/);
  assert.doesNotMatch(blogSource, /local-posts/);
  assert.match(explorerSource, /article\.title, article\.dek, \.\.\.article\.tags/);
  assert.doesNotMatch(explorerSource, /activeTag|tagCounts|Search Topics/);
  assert.match(homeSource, /slice\(0, 3\)/);
  assert.match(homeSource, /<ArticleCard/);
  assert.match(explorerSource, /<ArticleCard/);
  assert.match(cardSource, /article\.published/);
  assert.doesNotMatch(cardSource, /article\.updated/);
  assert.match(cardSource, /article-card-tags/);
  assert.match(cardSource, /article-card-arrow/);
  assert.match(cardSource, /article-card-trace/);
  assert.doesNotMatch(cardSource, /viewTransitionName/);
  assert.doesNotMatch(cardSource, /article-card-image|<img|coverImage/);
  assert.doesNotMatch(cardSource, /author|avatar|readTime|readingTime/);
  assert.doesNotMatch(homeSource, /index-footer/);
  assert.doesNotMatch([homeSource, cardSource, headerSource, postPageSource, mdxSource].join("\n"), /from ["']next\/link["']/);
  assert.doesNotMatch(headerSource, />首页</);
  assert.match(headerSource, /href="\/">Home/);
  assert.match(headerSource, /href="\/posts">Blog/);
  assert.match(headerSource, /href="\/about">About/);
  assert.doesNotMatch(headerSource, /site-global-search|搜索文章/);
  assert.match(headerSource, /<ThemeToggle/);
  assert.doesNotMatch(themeSource, /["']use client["']|localStorage|onClick/);
  assert.match(layoutSource, /localStorage\.getItem\("zyf-theme"/);
  assert.match(layoutSource, /localStorage\.setItem\("zyf-theme"/);
  assert.match(layoutSource, /IntersectionObserver/);
  assert.match(layoutSource, /window\.addEventListener\('scroll', updateOnScroll, \{ passive: true \}\)/);
  assert.match(layoutSource, /matchMedia\('\(max-width: 1120px\)'\)/);
  assert.match(layoutSource, /setTimeout\(initializeReadingTrace, 500\)/);
  assert.doesNotMatch(layoutSource, /zyf-toc-position|pointermove|setPointerCapture|data\.dragging/);
  assert.match(baseStyles, /:root\[data-theme="dark"\]/);
  assert.doesNotMatch(baseStyles, /@view-transition|::view-transition|animation: page-enter/);
  assert.match(baseStyles, /\.site-header \{[\s\S]*?position: relative;/);
  assert.doesNotMatch(baseStyles.match(/\.site-header \{[\s\S]*?\n\}/)?.[0] ?? "", /position: sticky|position: fixed/);
  assert.match(contentStyles, /\.article-toc nav \{[\s\S]*?overflow-y: auto;/);
  assert.match(contentStyles, /\.article-toc nav \{[\s\S]*?touch-action: pan-y;/);
  assert.match(contentStyles, /\.article-toc \{[\s\S]*?position: sticky;/);
  assert.doesNotMatch(contentStyles.match(/\.article-toc \{[\s\S]*?\n\}/)?.[0] ?? "", /position: fixed|backdrop-filter|box-shadow/);
  assert.doesNotMatch(contentStyles, /\.article-toc nav::before|\.article-toc nav a::before/);
  assert.doesNotMatch(tocSource, /["']use client["']|useState|onClick/);
  assert.match(tocSource, /<aside/);
  assert.match(tocSource, /data-open="true"/);
  assert.match(tocSource, /suppressHydrationWarning/);
  assert.ok((tocSource.match(/suppressHydrationWarning/g) ?? []).length >= 3);
  assert.match(tocSource, /aria-controls="article-toc-body"/);
  assert.match(tocSource, /aria-expanded="true"/);
  assert.equal(tocSource.match(/<button/g)?.length, 1 + (tocSource.match(/article-toc-group-caret/g)?.length ?? 0));
  assert.doesNotMatch(tocSource, /article-toc-toggle|article-toc-controls|article-toc-grip/);
  assert.match(tocSource, /article-toc-caret/);
  assert.match(tocSource, /article-toc-body/);
  assert.match(tocSource, /aria-current=\{index === 0/);
  assert.match(contentStyles, /\.article-layout \{[\s\S]*?display: grid;/);
  assert.match(contentStyles, /\.article-layout \{[\s\S]*?column-gap: clamp\(36px, 3\.8vw, 56px\);/);
  assert.match(contentStyles, /\.article-layout \{[\s\S]*?width: calc\(100vw - 64px\);/);
  assert.match(baseStyles, /--article-column: min\(55vw, 960px\);/);
  assert.match(contentStyles, /\.post-heading \{[\s\S]*?max-width: var\(--article-column\);[\s\S]*?text-align: center;/);
  assert.match(contentStyles, /\.post-utility \{[\s\S]*?justify-content: space-between;[\s\S]*?width: var\(--article-column\);/);
  assert.match(contentStyles, /\.post-hero-meta \{[\s\S]*?justify-content: center;/);
  assert.match(contentStyles, /\.article-content \{[\s\S]*?max-width: var\(--article-column\);/);
  assert.match(contentStyles, /\.article-toc-title \{[\s\S]*?font-size: 0\.81rem;[\s\S]*?font-weight: 640;/);
  assert.match(contentStyles, /\.article-toc nav a \{[\s\S]*?font-size: 0\.8rem;[\s\S]*?font-weight: 620;/);
  assert.match(tocSource, /article-toc-group-caret/);
  assert.match(contentStyles, /\.article-toc \{[\s\S]*?max-width: 240px;/);
  assert.match(contentStyles, /\.article-content \{[\s\S]*?grid-column: 2;/);
  assert.match(contentStyles, /\.post-hero h1 \{[\s\S]*?font-size: clamp\(2rem, 2\.9vw, 2\.7rem\);[\s\S]*?font-weight: 540;/);
  assert.match(contentStyles, /\.article-prose \{[\s\S]*?font-size: 0\.93rem;[\s\S]*?line-height: 1\.72;/);
  assert.doesNotMatch(contentStyles.match(/\.article-layout \{[\s\S]*?\n\}/)?.[0] ?? "", /border-top/);
  assert.doesNotMatch(contentStyles.match(/\.article-prose h2 \{[\s\S]*?\n\}/)?.[0] ?? "", /border-top|padding-top/);
  assert.match(contentStyles, /\.article-prose hr \{[\s\S]*?display: none;/);
  assert.doesNotMatch(contentStyles, /\.article-layout:has\(/);
  assert.doesNotMatch(postPageSource, /<span>ZYF<\/span>/);
  assert.doesNotMatch(postPageSource, /post-byline/);
  assert.match(postPageSource, /post-utility/);
  assert.match(postPageSource, /post\.updated/);
  assert.ok(postPageSource.indexOf('className="post-utility"') < postPageSource.indexOf('className="post-heading"'));
  assert.ok(postPageSource.indexOf('<ArticleToc items={toc}') > postPageSource.indexOf('className="page-frame article-layout"'));
  assert.ok(postPageSource.indexOf('<ArticleToc items={toc}') < postPageSource.indexOf('className="article-content"'));
  assert.doesNotMatch(postPageSource, /viewTransitionName/);
  assert.ok(postPageSource.indexOf('className="post-hero-meta"') > postPageSource.indexOf('className="post-utility"'));
  assert.match(readme, /content\/posts\/<slug>\.mdx/);
  assert.doesNotMatch(packageJson, /drizzle|libsql|vercel\/blob|db:generate|tailwind/);

  await assert.rejects(access(new URL("../lib/blog-db.ts", import.meta.url)));
  await assert.rejects(access(new URL("../app/studio/page.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/write/page.tsx", import.meta.url)));
});

test("renders a global-search archive without sidebar filters", async () => {
  const response = await render("/posts");
  assert.equal(response.status, 200);
  const html = await response.text();
  const cards = [...html.matchAll(/href="\/posts\/([^"]+)"[^>]*><time class="article-card-meta" dateTime="([^"]+)"/g)]
    .map(([, slug, date]) => ({ slug, date }));
  const cardTimestamps = cards.map(({ date }) => Date.parse(`${date}T00:00:00Z`));
  assert.match(html, /Search the archive/);
  assert.match(html, /<h1>Archive<\/h1>/);
  assert.ok((html.match(/class="article-card-row"/g) ?? []).length >= 4);
  assert.deepEqual(cardTimestamps, [...cardTimestamps].sort((left, right) => right - left));
  assert.equal(cards.find(({ slug }) => slug === "codex-agent-runtime")?.date, "2026-08-28");
  assert.equal(cards.find(({ slug }) => slug === "codex-app-server-guide")?.date, "2026-07-31");
  assert.doesNotMatch(html, /<span>Archive<\/span>|<h1>Blog<\/h1>/);
  assert.doesNotMatch(html, /搜索标题或摘要|<h1>文章<\/h1>/);
  assert.doesNotMatch(html, /topics-header|topic-grid|Blog categories|Articles \(|Shares \(|Notes \(/);
});

test("renders the release-ready About page with confirmed identity and domains", async () => {
  const response = await render("/about");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Agent Infra Engineer at Alibaba/);
  assert.match(html, /Agent Runtime/);
  assert.match(html, /AI Open Platform/);
  assert.match(html, /MCP Gateway/);
  assert.match(html, /AgentTeam/);
  assert.match(html, /https:\/\/github\.com\/zyfn/);
  assert.doesNotMatch(html, /目前关注|文章、分享与笔记/);
});

test("does not ship removed mock articles", async () => {
  const response = await render("/posts/agent-runtime");
  assert.equal(response.status, 404);
});
