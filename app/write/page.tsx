import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WriterForm } from "@/components/WriterForm";
import { ensureBlogOwner, getStoredPost, listStoredPosts } from "@/lib/blog-db";

export const metadata: Metadata = {
  title: "写文章",
  description: "上传 Markdown 或直接撰写并发布博客文章。",
};

export const dynamic = "force-dynamic";

type WritePageProps = { searchParams: Promise<{ edit?: string }> };

export default async function WritePage({ searchParams }: WritePageProps) {
  const { edit } = await searchParams;
  const returnTo = edit ? `/write?edit=${encodeURIComponent(edit)}` : "/write";
  const user = await requireChatGPTUser(returnTo);
  const isOwner = await ensureBlogOwner(user.userId);

  if (!isOwner) {
    return (
      <div className="site-shell" id="top">
        <SiteHeader />
        <main className="access-denied page-frame">
          <span className="overline">PRIVATE EDITOR</span>
          <h1>这里是站长的写作后台</h1>
          <p>当前账号可以阅读公开文章，但没有创建、编辑或删除内容的权限。</p>
          <Link className="button button-primary" href="/posts">返回文章列表</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const [posts, currentPost] = await Promise.all([
    listStoredPosts({ includeDrafts: true }),
    edit ? getStoredPost(edit, true) : Promise.resolve(null),
  ]);

  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main>
        <header className="writer-hero page-frame">
          <div>
            <span className="overline">PRIVATE EDITOR</span>
            <h1>{currentPost ? "编辑文章" : "写一篇新文章"}</h1>
            <p>上传文件或直接写 Markdown。保存为草稿，准备好后再发布。</p>
          </div>
          <div className="writer-account">
            <span>{user.displayName}</span>
            <a href={chatGPTSignOutPath("/")}>退出</a>
          </div>
        </header>
        <div className="page-frame writer-page">
          <WriterForm currentPost={currentPost} posts={posts} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
