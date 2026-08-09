import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull(),
    topic: text("topic").notNull().default("随笔"),
    format: text("format").notNull().default("文章"),
    tags: text("tags").notNull().default("[]"),
    tone: text("tone").notNull().default("ink"),
    status: text("status").notNull().default("published"),
    authorId: text("author_id").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    publishedAt: integer("published_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_blog_posts_slug").on(table.slug),
    index("idx_blog_posts_status_published").on(table.status, table.publishedAt),
  ],
);

export const blogSettings = sqliteTable("blog_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
