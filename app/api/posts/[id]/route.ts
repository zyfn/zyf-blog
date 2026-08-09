import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  deleteStoredPost,
  ensureBlogOwner,
  updateStoredPost,
  type PostInput,
} from "@/lib/blog-db";

type RouteProps = { params: Promise<{ id: string }> };

function normalizeInput(value: unknown): PostInput {
  if (!value || typeof value !== "object") throw new Error("提交内容无效");
  const input = value as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";
  if (!title || !content) throw new Error("标题和正文不能为空");
  if (title.length > 180 || content.length > 400_000) throw new Error("文章内容过长");

  return {
    title,
    slug: typeof input.slug === "string" ? input.slug.trim() : undefined,
    excerpt: typeof input.excerpt === "string" ? input.excerpt.trim().slice(0, 240) : "",
    content,
    topic: typeof input.topic === "string" && input.topic.trim() ? input.topic.trim().slice(0, 40) : "随笔",
    format: typeof input.format === "string" && input.format.trim() ? input.format.trim().slice(0, 24) : "文章",
    tags: Array.isArray(input.tags)
      ? input.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean).slice(0, 8)
      : [],
    status: input.status === "draft" ? "draft" : "published",
  };
}

async function authorize() {
  const user = await getChatGPTUser();
  if (!user) return { error: NextResponse.json({ error: "请先登录" }, { status: 401 }) };
  if (!(await ensureBlogOwner(user.userId))) {
    return { error: NextResponse.json({ error: "没有发布权限" }, { status: 403 }) };
  }
  return { user };
}

export async function PUT(request: Request, { params }: RouteProps) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const post = await updateStoredPost(id, normalizeInput(await request.json()));
    if (!post) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存失败" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const deleted = await deleteStoredPost(id);
  return deleted
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "文章不存在" }, { status: 404 });
}
