import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArticleToc } from "@/lib/articles";
import { getBlogPost, listBlogPosts, toSummary } from "@/lib/blog";

type PostPageProps = { params: Promise<{ slug: string }> };

function decodedSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(decodedSlug(slug));
  if (!post) return {};
  return {
    title: post.title,
    description: post.dek,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.dek,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(decodedSlug(slug));
  if (!post) notFound();

  const toc = getArticleToc(post.body);
  const related = (await listBlogPosts())
    .filter((item) => item.slug !== post.slug)
    .slice(0, 2)
    .map(toSummary);

  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main>
        <header className="post-hero page-frame">
          <Link className="back-link" href="/posts">← 全部文章</Link>
          <div className="post-hero-meta">
            <span>{post.topic}</span>
            <span>{post.format}</span>
            <span>{post.readTime}</span>
          </div>
          <h1>{post.title}</h1>
          <p>{post.dek}</p>
          <div className="post-byline">
            <span>NOTES 编辑</span>
            <span>更新于 {post.updated}</span>
          </div>
        </header>

        <div className="page-frame article-layout">
          {toc.length ? (
            <aside className="article-toc" aria-label="文章目录">
              <span>本文目录</span>
              <nav>
                {toc.map((item, index) => (
                  <a href={`#${item.id}`} key={item.id}>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>
          ) : <div />}
          <article className="article-content">
            <MarkdownArticle markdown={post.body} />
          </article>
        </div>

        {related.length ? (
          <section className="related page-frame">
            <div className="section-heading-simple">
              <div><span>KEEP READING</span><h2>继续阅读</h2></div>
            </div>
            <div className="post-list">
              {related.map((article, index) => (
                <ArticleCard article={article} key={article.slug} ordinal={`0${index + 1}`} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
