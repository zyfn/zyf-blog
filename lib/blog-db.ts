import { env } from "cloudflare:workers";

export type StoredPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  topic: string;
  format: string;
  tags: string[];
  tone: "orange" | "sage" | "ink" | "sand";
  status: "published" | "draft";
  authorId: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number;
};

type StoredPostRow = Omit<StoredPost, "tags"> & { tags: string };

const postColumns = `
  id, slug, title, excerpt, content, topic, format, tags, tone, status,
  author_id AS authorId,
  created_at AS createdAt,
  updated_at AS updatedAt,
  published_at AS publishedAt
`;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    topic TEXT NOT NULL DEFAULT '随笔',
    format TEXT NOT NULL DEFAULT '文章',
    tags TEXT NOT NULL DEFAULT '[]',
    tone TEXT NOT NULL DEFAULT 'ink',
    status TEXT NOT NULL DEFAULT 'published',
    author_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    published_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts(status, published_at DESC)`,
  `CREATE TABLE IF NOT EXISTS blog_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  )`,
];

let schemaReady: Promise<void> | null = null;

function database() {
  if (!env.DB) throw new Error("Blog database is unavailable");
  return env.DB;
}

async function ensureSchema() {
  if (!schemaReady) {
    const db = database();
    schemaReady = db
      .batch(schemaStatements.map((statement) => db.prepare(statement)))
      .then(async () => {
        await db.prepare("PRAGMA optimize").run();
      });
  }
  return schemaReady;
}

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
}

function mapRow(row: StoredPostRow): StoredPost {
  return { ...row, tags: parseTags(row.tags) };
}

export async function listStoredPosts(options?: { includeDrafts?: boolean }) {
  await ensureSchema();
  const db = database();
  const query = options?.includeDrafts
    ? `SELECT ${postColumns} FROM blog_posts ORDER BY updated_at DESC`
    : `SELECT ${postColumns} FROM blog_posts WHERE status = ? ORDER BY published_at DESC`;
  const statement = options?.includeDrafts
    ? db.prepare(query)
    : db.prepare(query).bind("published");
  const result = await statement.all<StoredPostRow>();
  return result.results.map(mapRow);
}

export async function getStoredPost(slug: string, includeDrafts = false) {
  await ensureSchema();
  const db = database();
  const statement = includeDrafts
    ? db.prepare(`SELECT ${postColumns} FROM blog_posts WHERE slug = ? LIMIT 1`).bind(slug)
    : db
        .prepare(`SELECT ${postColumns} FROM blog_posts WHERE slug = ? AND status = ? LIMIT 1`)
        .bind(slug, "published");
  const row = await statement.first<StoredPostRow>();
  return row ? mapRow(row) : null;
}

export async function ensureBlogOwner(userId: string) {
  await ensureSchema();
  const db = database();
  await db
    .prepare("INSERT OR IGNORE INTO blog_settings (key, value) VALUES (?, ?)")
    .bind("owner_user_id", userId)
    .run();
  const owner = await db
    .prepare("SELECT value FROM blog_settings WHERE key = ? LIMIT 1")
    .bind("owner_user_id")
    .first<{ value: string }>();
  return owner?.value === userId;
}

function slugify(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

async function uniqueSlug(title: string, requested?: string, currentId?: string) {
  const base = slugify(requested || title) || `post-${Date.now()}`;
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await database()
      .prepare("SELECT id FROM blog_posts WHERE slug = ? LIMIT 1")
      .bind(candidate)
      .first<{ id: string }>();
    if (!existing || existing.id === currentId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export type PostInput = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  topic: string;
  format: string;
  tags: string[];
  status: "published" | "draft";
};

export async function createStoredPost(input: PostInput, authorId: string) {
  await ensureSchema();
  const db = database();
  const now = Date.now();
  const id = crypto.randomUUID();
  const slug = await uniqueSlug(input.title, input.slug);

  await db
    .prepare(
      `INSERT INTO blog_posts (
        id, slug, title, excerpt, content, topic, format, tags, tone,
        status, author_id, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      slug,
      input.title,
      input.excerpt,
      input.content,
      input.topic,
      input.format,
      JSON.stringify(input.tags),
      "ink",
      input.status,
      authorId,
      now,
      now,
      now,
    )
    .run();

  return getStoredPost(slug, true);
}

export async function updateStoredPost(id: string, input: PostInput) {
  await ensureSchema();
  const db = database();
  const current = await db
    .prepare("SELECT id, published_at AS publishedAt FROM blog_posts WHERE id = ? LIMIT 1")
    .bind(id)
    .first<{ id: string; publishedAt: number }>();
  if (!current) return null;

  const slug = await uniqueSlug(input.title, input.slug, id);
  const now = Date.now();
  await db
    .prepare(
      `UPDATE blog_posts SET
        slug = ?, title = ?, excerpt = ?, content = ?, topic = ?, format = ?,
        tags = ?, status = ?, updated_at = ?, published_at = ?
      WHERE id = ?`,
    )
    .bind(
      slug,
      input.title,
      input.excerpt,
      input.content,
      input.topic,
      input.format,
      JSON.stringify(input.tags),
      input.status,
      now,
      input.status === "published" ? now : current.publishedAt,
      id,
    )
    .run();

  return getStoredPost(slug, true);
}

export async function deleteStoredPost(id: string) {
  await ensureSchema();
  const result = await database()
    .prepare("DELETE FROM blog_posts WHERE id = ?")
    .bind(id)
    .run();
  return result.meta.changes > 0;
}
