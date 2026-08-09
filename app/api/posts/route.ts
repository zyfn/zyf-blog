import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  createStoredPost,
  ensureBlogOwner,
  type PostInput,
} from "@/lib/blog-db";

function excerptFrom(content: string) {
  return content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[`*_>#()|]/g, " ")
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function validateInput(value: unknown): PostInput {
  if (!value || typeof value !== "object") throw new Error("提交内容无效");
  const input = value as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";
  if (!title || title.length > 180) throw new Error("标题不能为空，且不能超过 180 字");
  if (!content || content.length > 400_000) throw new Error("正文不能为空，且不能超过 40 万字节");

  const tags = Array.isArray(input.tags)
    ? input.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];

  return {
    title,
    slug: typeof input.slug === "string" ? input.slug.trim() : undefined,
    excerpt:
      typeof input.excerpt === "string" && input.excerpt.trim()
        ? input.excerpt.trim().slice(0, 240)
        : excerptFrom(content),
    content,
    topic:
      typeof input.topic === "string" && input.topic.trim()
        ? input.topic.trim().slice(0, 40)
        : "随笔",
    format:
      typeof input.format === "string" && input.format.trim()
        ? input.format.trim().slice(0, 24)
        : "文章",
    tags,
    status: input.status === "draft" ? "draft" : "published",
  };
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  if (!(await ensureBlogOwner(user.userId))) {
    return NextResponse.json({ error: "没有发布权限" }, { status: 403 });
  }

  try {
    const input = validateInput(await request.json());
    const post = await createStoredPost(input, user.userId);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "发布失败" },
      { status: 400 },
    );
  }
}
