CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`content` text NOT NULL,
	`topic` text DEFAULT '随笔' NOT NULL,
	`format` text DEFAULT '文章' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`tone` text DEFAULT 'ink' NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_blog_posts_slug` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_blog_posts_status_published` ON `blog_posts` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `blog_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
