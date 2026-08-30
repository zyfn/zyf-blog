import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleToc } from "@/components/ArticleToc";
import { MdxArticle } from "@/components/MdxArticle";
import { SiteHeader } from "@/components/SiteHeader";
import { getArticleToc } from "@/lib/articles";
import { getBlogPost, listBlogPosts } from "@/lib/blog";

type PostPageProps = { params: Promise<{ slug: string }> };

function decodedSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateStaticParams() {
  return (await listBlogPosts()).map((post) => ({ slug: post.slug }));
}

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
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(decodedSlug(slug));
  if (!post) notFound();

  const toc = getArticleToc(post.body);

  return (
    <div className="site-shell" id="top">
      <SiteHeader active="articles" />
      {toc.length ? <ArticleToc items={toc} /> : null}
      <main className="reader-page">
        <header className="post-hero page-frame">
          <div className="post-heading">
            <div className="post-utility">
              <a className="back-link" href="/posts"><span aria-hidden="true">←</span> Back to Blog</a>
              <time dateTime={post.updated.replaceAll(".", "-")}>Updated {post.updated}</time>
            </div>
            <h1>{post.title}</h1>
            <p>{post.dek}</p>
            <div className="post-hero-meta">
              {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
        </header>

        <div className="page-frame article-layout">
          <article className="article-content">
            <MdxArticle Content={post.Content} />
          </article>
        </div>
      </main>
    </div>
  );
}
