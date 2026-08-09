"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import { MarkdownArticle } from "./MarkdownArticle";

type EditablePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  topic: string;
  format: string;
  tags: string[];
  status: "published" | "draft";
  updatedAt: number;
};

type WriterFormProps = {
  currentPost: EditablePost | null;
  posts: EditablePost[];
};

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  topic: string;
  format: string;
  tags: string;
};

const emptyDraft: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  topic: "随笔",
  format: "文章",
  tags: "",
};

function valueFromFrontmatter(frontmatter: string, keys: string[]) {
  for (const key of keys) {
    const match = frontmatter.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "im"));
    if (match) return match[1].trim();
  }
  return "";
}

function parseUploadedArticle(raw: string, filename: string): Partial<Draft> {
  let content = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  let frontmatter = "";
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (frontmatterMatch) {
    frontmatter = frontmatterMatch[1];
    content = content.slice(frontmatterMatch[0].length).trim();
  }

  const heading = content.match(/^#\s+(.+)$/m);
  const frontmatterTitle = valueFromFrontmatter(frontmatter, ["title"]);
  const inferredTitle = frontmatterTitle || heading?.[1]?.trim() || filename.replace(/\.(md|markdown|txt)$/i, "");

  if (heading && !frontmatterTitle) {
    content = content.replace(`${heading[0]}\n`, "").trim();
  }

  const rawTags = valueFromFrontmatter(frontmatter, ["tags", "keywords"])
    .replace(/^\[|\]$/g, "")
    .replace(/["']/g, "");

  return {
    title: inferredTitle,
    excerpt: valueFromFrontmatter(frontmatter, ["description", "excerpt", "summary"]),
    topic: valueFromFrontmatter(frontmatter, ["topic", "category"]) || undefined,
    tags: rawTags || undefined,
    content,
  };
}

function updateDraftValue<K extends keyof Draft>(
  setter: Dispatch<SetStateAction<Draft>>,
  key: K,
  value: Draft[K],
) {
  setter((current) => ({ ...current, [key]: value }));
}

export function WriterForm({ currentPost, posts }: WriterFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(() =>
    currentPost
      ? {
          title: currentPost.title,
          slug: currentPost.slug,
          excerpt: currentPost.excerpt,
          content: currentPost.content,
          topic: currentPost.topic,
          format: currentPost.format,
          tags: currentPost.tags.join(", "),
        }
      : emptyDraft,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const hasPreview = useMemo(() => draft.content.trim().length > 0, [draft.content]);

  async function loadFile(file?: File) {
    if (!file) return;
    const lowerName = file.name.toLocaleLowerCase();
    if (!lowerName.endsWith(".md") && !lowerName.endsWith(".markdown") && !lowerName.endsWith(".txt")) {
      setMessage("目前支持 .md、.markdown 和 .txt 文件。");
      return;
    }
    if (file.size > 400_000) {
      setMessage("文件不能超过 400 KB。");
      return;
    }

    const parsed = parseUploadedArticle(await file.text(), file.name);
    setDraft((current) => ({
      ...current,
      ...Object.fromEntries(Object.entries(parsed).filter(([, value]) => value !== undefined)),
    }));
    setMessage(`已读取 ${file.name}，发布前可以继续调整。`);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    await loadFile(event.target.files?.[0]);
    event.target.value = "";
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    await loadFile(event.dataTransfer.files?.[0]);
  }

  async function save(status: "published" | "draft") {
    setMessage("");
    if (!draft.title.trim() || !draft.content.trim()) {
      setMessage("请先填写标题和正文。");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(currentPost ? `/api/posts/${currentPost.id}` : "/api/posts", {
        method: currentPost ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...draft,
          tags: draft.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
          status,
        }),
      });
      const payload = (await response.json()) as { post?: EditablePost; error?: string };
      if (!response.ok || !payload.post) throw new Error(payload.error || "保存失败");

      setMessage(status === "published" ? "文章已发布。" : "草稿已保存。");
      if (status === "published") {
        router.push(`/posts/${payload.post.slug}`);
      } else {
        router.push(`/write?edit=${encodeURIComponent(payload.post.slug)}`);
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!currentPost || !window.confirm(`确定删除《${currentPost.title}》吗？此操作无法撤销。`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/posts/${currentPost.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "删除失败");
      router.push("/write");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败，请稍后再试。");
      setBusy(false);
    }
  }

  return (
    <div className="writer-layout">
      <div className="writer-main">
        <section
          className={`upload-panel${dragging ? " is-dragging" : ""}`}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <div>
            <span className="upload-mark">↑</span>
            <strong>上传一篇文章</strong>
            <p>拖入 .md、.markdown 或 .txt，也可以直接在下方粘贴内容。</p>
          </div>
          <button className="button button-secondary" onClick={() => fileInputRef.current?.click()} type="button">
            选择文件
          </button>
          <input
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            className="visually-hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
        </section>

        <section className="editor-panel">
          <div className="editor-grid">
            <label className="field field-wide">
              <span>标题</span>
              <input
                maxLength={180}
                onChange={(event) => updateDraftValue(setDraft, "title", event.target.value)}
                placeholder="这篇文章讲什么？"
                value={draft.title}
              />
            </label>
            <label className="field">
              <span>专题</span>
              <input
                maxLength={40}
                onChange={(event) => updateDraftValue(setDraft, "topic", event.target.value)}
                placeholder="例如：工程实践"
                value={draft.topic}
              />
            </label>
            <label className="field">
              <span>内容类型</span>
              <input
                maxLength={24}
                onChange={(event) => updateDraftValue(setDraft, "format", event.target.value)}
                placeholder="文章 / 教程 / 随笔"
                value={draft.format}
              />
            </label>
            <label className="field field-wide">
              <span>摘要</span>
              <textarea
                className="summary-input"
                maxLength={240}
                onChange={(event) => updateDraftValue(setDraft, "excerpt", event.target.value)}
                placeholder="可留空，发布时会从正文自动提取。"
                value={draft.excerpt}
              />
            </label>
            <label className="field">
              <span>标签</span>
              <input
                onChange={(event) => updateDraftValue(setDraft, "tags", event.target.value)}
                placeholder="用逗号分隔"
                value={draft.tags}
              />
            </label>
            <label className="field">
              <span>固定链接</span>
              <input
                onChange={(event) => updateDraftValue(setDraft, "slug", event.target.value)}
                placeholder="留空自动生成"
                value={draft.slug}
              />
            </label>
          </div>

          <div className="content-editor-grid">
            <label className="field markdown-field">
              <span>Markdown 正文</span>
              <textarea
                onChange={(event) => updateDraftValue(setDraft, "content", event.target.value)}
                placeholder={"从这里开始写。支持标题、列表、表格、引用、代码块和链接。\n\n## 第一节"}
                spellCheck="false"
                value={draft.content}
              />
            </label>
            <div className="preview-panel">
              <span className="field-label">实时预览</span>
              {hasPreview ? (
                <MarkdownArticle markdown={draft.content} />
              ) : (
                <div className="preview-empty">正文预览会显示在这里。</div>
              )}
            </div>
          </div>

          <div className="editor-actions">
            <div aria-live="polite" className="save-message">{message}</div>
            <div>
              {currentPost ? (
                <button className="text-danger" disabled={busy} onClick={remove} type="button">删除</button>
              ) : null}
              <button className="button button-secondary" disabled={busy} onClick={() => save("draft")} type="button">
                保存草稿
              </button>
              <button className="button button-primary" disabled={busy} onClick={() => save("published")} type="button">
                {busy ? "正在保存…" : currentPost?.status === "published" ? "更新文章" : "发布文章"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside className="writer-sidebar">
        <div className="sidebar-heading">
          <span>你的内容</span>
          {currentPost ? <Link href="/write">＋ 新文章</Link> : null}
        </div>
        {posts.length ? (
          <div className="draft-list">
            {posts.map((post) => (
              <Link className={currentPost?.id === post.id ? "is-current" : ""} href={`/write?edit=${encodeURIComponent(post.slug)}`} key={post.id}>
                <span>{post.status === "published" ? "已发布" : "草稿"}</span>
                <strong>{post.title}</strong>
                <small>{new Intl.DateTimeFormat("zh-CN").format(new Date(post.updatedAt))}</small>
              </Link>
            ))}
          </div>
        ) : (
          <p className="sidebar-empty">还没有通过编辑器发布的文章。</p>
        )}
      </aside>
    </div>
  );
}
