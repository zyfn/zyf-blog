import type { Metadata } from "next";
import { ArticleExplorer } from "@/components/ArticleExplorer";
import { listBlogPosts, toSummary } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "浏览全部文章、实践分享与学习笔记。",
};

export default async function PostsPage() {
  const posts = await listBlogPosts();
  return (
    <div className="site-shell" id="top">
      <ArticleExplorer articles={posts.map(toSummary)} />
    </div>
  );
}
