import type { Metadata } from "next";
import { ArticleExplorer } from "@/components/ArticleExplorer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { listBlogPosts, toSummary } from "@/lib/blog";

export const metadata: Metadata = {
  title: "全部文章",
  description: "浏览博客中的全部文章、教程与长期笔记。",
};

export const dynamic = "force-dynamic";

type PostsPageProps = { searchParams: Promise<{ topic?: string }> };

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { topic } = await searchParams;
  const posts = await listBlogPosts();
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main>
        <section className="archive-hero page-frame">
          <span className="overline">THE ARCHIVE</span>
          <h1>全部文章</h1>
          <p>按专题浏览，或搜索标题、摘要和标签。</p>
        </section>
        <section className="archive-content page-frame">
          <ArticleExplorer articles={posts.map(toSummary)} initialTopic={topic} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
