import { BlogHome } from "@/components/BlogHome";
import { listBlogPosts, toSummary } from "@/lib/blog";

export default async function Home() {
  const posts = await listBlogPosts();

  return (
    <div className="site-shell home-site-shell" id="top">
      <BlogHome articles={posts.map(toSummary)} />
    </div>
  );
}
