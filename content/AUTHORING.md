# MDX authoring standard

This directory is the source of truth for the public blog. Articles are committed with the site, reviewed in Git, and published by Vercel after changes reach `main`.

## 1. File and resource layout

```text
content/
├── AUTHORING.md
├── AGENTS.md
├── templates/
│   └── post.mdx
└── posts/
    └── <slug>.mdx

public/images/posts/<slug>/
├── cover.webp
├── architecture.svg
└── screenshot.webp
```

- Use a lowercase kebab-case slug, for example `codex-agent-runtime`.
- Keep the article and its resource directory on the same slug.
- Prefer WebP or AVIF for screenshots and photographs; use SVG for diagrams; use PNG only when lossless raster output is necessary.
- Never reference a local absolute path or an image outside this repository.

## 2. Required frontmatter

```yaml
---
title: Article title
date: 2026-08-29
lastmod: 2026-08-29
summary: One concrete sentence used by Archive, search and metadata.
tags:
  - Agent Runtime
  - Codex
featured: false
draft: true
---
```

Rules:

- `title`, `summary`, `date`, `lastmod`, `tags`, `featured`, and `draft` are required.
- Dates use `YYYY-MM-DD`. `date` is the original publication date; `lastmod` changes only for a meaningful content update, not spelling or formatting fixes.
- Keep `summary` self-contained and under 180 characters. Do not start it with “本文介绍”.
- Use one to six specific topic tags. Prefer `Codex`, `MCP Gateway`, or `Agent Runtime`; do not use content-form labels such as “文章”, “分享”, or “笔记”.
- Keep unfinished work as `draft: true`. Production excludes drafts.
- `featured: true` is editorial selection, not a substitute for a cover image.

Optional fields:

```yaml
cover: /images/posts/<slug>/cover.webp
slug: custom-public-slug
```

Normally omit `slug` and let the filename define it.

## 3. Article structure

- Do not add an H1 in the body; the page renders `title` as the only H1.
- Use H2 for the main reading path and H3/H4 only inside the preceding section.
- Enter the real problem quickly. Avoid broad industry openings, feature inventories, slogans, and repeated conclusions.
- Distinguish verified facts, source-based inference, personal judgement, and recommendations.
- Put version-sensitive claims near a verification date and link to primary sources.
- Remove internal-only details before publishing: credentials, employee information, private domains, absolute local paths, unpublished product plans, and implementation-only handoff notes.

## 4. Standard Markdown and GFM

The site supports headings, paragraphs, links, ordered and unordered lists, blockquotes, task lists, strikethrough, autolinks, fenced code, and GFM tables.

Always declare the language of a code block:

````md
```ts
const thread = await client.startThread();
```
````

Use a table only for exact mappings or comparisons:

```md
| Layer | Responsibility | Boundary |
| --- | --- | --- |
| Runtime | Advances the agent loop | Does not prove business completion |
| Sandbox | Limits technical access | Does not define product authorization |
```

Large tables scroll horizontally on narrow screens. Split a table when a cell turns into a paragraph.

## 5. Images and diagrams

Use standard Markdown for an image that needs no caption:

```md
![Codex Runtime architecture](/images/posts/codex-agent-runtime/architecture.webp)
```

Use the shared `Figure` component for a captioned or full-width visual:

```mdx
<Figure
  src="/images/posts/codex-agent-runtime/architecture.svg"
  alt="Codex Runtime architecture showing the agent loop and its control boundaries"
  caption="The model proposes actions; the runtime executes, constrains and records them."
/>
```

- `alt` describes the information carried by the image; do not write “image of”.
- `caption` explains why the reader should inspect the visual instead of repeating the alt text.
- Use static SVG/PNG/WebP for architecture diagrams. Mermaid fences are not part of the publishing contract because the site does not run a full Mermaid renderer.
- Never encode essential explanations only in an image.

## 6. Approved MDX components

Only these shared components are currently approved:

```mdx
<Callout title="Boundary">
`turn/completed` proves that a turn ended; it does not prove that the requested business outcome exists.
</Callout>

<Figure
  src="/images/posts/example/diagram.svg"
  alt="Accessible description"
  caption="Optional caption"
/>
```

Do not import arbitrary React components from an article. Add reusable capabilities to `components/MdxArticle.tsx`, document them here, and verify them in a production build.

Raw HTML comments are invalid in MDX. Use `{/* comment */}` only when a source note must remain in the file.

## 7. Publishing checklist

1. Start from `content/templates/post.mdx` and keep `draft: true` while writing.
2. Put every image under the article's resource directory and use an absolute site path.
3. Confirm external links, version-sensitive claims, code samples, tables, and mobile readability.
4. Set `draft: false` only after the article is ready to appear publicly.
5. Run:

```bash
npm run content:check
npm run lint
npm test
npm run build
```

6. Review the rendered Archive page and article page before pushing to `main`.

