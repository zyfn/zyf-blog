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
  assert.match(html, />Blog<|>About</);
  assert.match(html, /images\/profile\/zyf\.jpg/);
  assert.doesNotMatch(html, /site-logo-wordmark|site-global-search|>首页</);
  assert.match(html, /href="\/posts"/);
  assert.match(html, /href="\/about"/);
  assert.equal((html.match(/class="article-card-row"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /ZYF Notes|全部标签|标签/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("uses repository MDX as the only publishing source", async () => {
  const [blogSource, explorerSource, homeSource, cardSource, headerSource, postPageSource, mdxSource, packageJson, readme] = await Promise.all([
    readFile(new URL("../lib/blog.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/ArticleExplorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/BlogHome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ArticleCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8"),
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
  assert.match(cardSource, /article-card-tags/);
  assert.doesNotMatch(cardSource, /author|avatar|readTime|readingTime/);
  assert.doesNotMatch(homeSource, /index-footer/);
  assert.doesNotMatch([homeSource, cardSource, headerSource, postPageSource, mdxSource].join("\n"), /from ["']next\/link["']/);
  assert.doesNotMatch(headerSource, />首页</);
  assert.match(headerSource, /href="\/posts">Blog/);
  assert.match(headerSource, /href="\/about">About/);
  assert.doesNotMatch(headerSource, /site-global-search|搜索文章/);
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
  assert.match(html, /Search the archive/);
  assert.match(html, /<h1>Archive<\/h1>/);
  assert.equal((html.match(/class="article-card-row"/g) ?? []).length, 4);
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
  assert.doesNotMatch(html, /目前关注|文章、分享与笔记/);
});

test("does not ship removed mock articles", async () => {
  const response = await render("/posts/agent-runtime");
  assert.equal(response.status, 404);
});
