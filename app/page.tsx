import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { listBlogPosts, toSummary } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await listBlogPosts();
  const summaries = posts.map(toSummary);
  const latest = summaries.slice(0, 5);
  const lead = latest[0];
  const topics = Array.from(new Set(summaries.map((post) => post.topic))).slice(0, 12);

  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main>
        <section className="blog-hero page-frame">
          <div className="hero-intro">
            <span className="overline">A QUIET PLACE FOR IDEAS</span>
            <h1>文章、教程<br />与长期笔记。</h1>
            <p>一个轻量、可搜索、可以持续更新的博客。写技术，也写任何值得反复阅读的内容。</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/posts">浏览文章</Link>
              <Link className="button button-secondary" href="/write">发布新文章</Link>
            </div>
          </div>
          {lead ? (
            <Link className="lead-story" href={`/posts/${lead.slug}`}>
              <div className="lead-story-top">
                <span>最新发布</span>
                <span>{lead.updated}</span>
              </div>
              <div>
                <span className="lead-topic">{lead.topic}</span>
                <h2>{lead.title}</h2>
                <p>{lead.dek}</p>
              </div>
              <span className="lead-read">阅读文章 ↗</span>
            </Link>
          ) : null}
        </section>

        <section className="home-posts page-frame">
          <div className="section-heading-simple">
            <div>
              <span>RECENT WRITING</span>
              <h2>最近更新</h2>
            </div>
            <Link href="/posts">查看全部 →</Link>
          </div>
          <div className="post-list">
            {latest.map((article, index) => (
              <ArticleCard
                article={article}
                key={article.slug}
                ordinal={String(index + 1).padStart(2, "0")}
              />
            ))}
          </div>
        </section>

        <section className="topic-section" id="topics">
          <div className="page-frame topic-inner">
            <div>
              <span className="overline">BROWSE BY TOPIC</span>
              <h2>从一个主题开始</h2>
            </div>
            <div className="topic-cloud">
              {topics.map((topic, index) => (
                <Link href={`/posts?topic=${encodeURIComponent(topic)}`} key={topic}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="write-callout page-frame">
          <div>
            <span className="overline">YOUR NEXT DRAFT</span>
            <h2>有新的内容？</h2>
            <p>上传 Markdown / TXT，或直接粘贴正文。标题、摘要和标签都可以在发布前调整。</p>
          </div>
          <Link className="button button-primary" href="/write">开始写作 ↗</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
