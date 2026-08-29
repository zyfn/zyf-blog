# Project instructions

This file is the working contract for agents editing `zyf-blog`. Follow more specific `AGENTS.md` files for files below their directory; every article task must also follow [`content/AGENTS.md`](./content/AGENTS.md) and [`content/AUTHORING.md`](./content/AUTHORING.md).

## Product boundary

This repository is a personal engineering blog for ZYF. Its public information architecture is intentionally small:

- `/` — personal introduction and the three latest published posts;
- `/posts` — searchable Archive of all published posts;
- `/posts/<slug>` — MDX article with metadata, tags and a collapsible reading table of contents;
- `/about` — short professional profile.

Do not add dashboards, an admin console, categories, comments, authentication, a CMS, a database, object storage, analytics, or new top-level sections unless the user explicitly requests that product change.

## Technology and architecture

- Use the existing Next.js App Router programming model through Vinext, Vite and Nitro.
- Use React 19 and strict TypeScript. Keep pages and data loading server-side by default.
- Add `"use client"` only to components that require browser state or events. Current valid examples are search, typewriter text, theme switching and TOC collapse.
- `content/posts` is the only article source. `lib/blog.ts` reads raw frontmatter and compiled MDX through `import.meta.glob`; do not introduce a second content store.
- Markdown uses MDX, `remark-gfm` and `rehype-slug`. Shared MDX elements are registered in `components/MdxArticle.tsx`.
- Production output targets Vercel through Nitro. `vercel.json` owns the build command.

## Navigation compatibility

Use native `<a>` elements for internal navigation. Do not introduce `next/link` without first proving that the current Vinext client runtime and Vercel build no longer reproduce the historical module failure. Existing regression tests intentionally protect this boundary.

## Component rules

- Reuse `ArticleCard` on both Home and Archive so article presentation stays consistent.
- Keep global navigation in `SiteHeader`; its order is `Home`, `Blog`, `About`.
- Keep article TOC behavior in `ArticleToc`; it must remain keyboard-accessible, independently scrollable and collapsible.
- Keep approved MDX components in `MdxArticle`. Do not import arbitrary React components from individual articles.
- Prefer semantic elements (`header`, `nav`, `main`, `article`, `aside`, `section`) and preserve meaningful labels, alt text, focus states and `aria-expanded` state.
- Do not add a dependency for a behavior that can be implemented clearly with the current React/CSS stack.

## Visual system

The visual direction is restrained Apple-inspired editorial design, not decorative glassmorphism.

- Preserve the light neutral canvas, one coral accent, subtle cool/warm ambient color and the existing dark theme.
- Use translucency to communicate hierarchy. Do not wrap every element in a card or stack multiple translucent surfaces.
- Keep typography readable: tight tracking for large headings, comfortable body leading and article prose near 65–76 characters.
- Interactive controls need immediate hover, pressed and keyboard-focus feedback. Motion must use opacity/transform where possible and honor `prefers-reduced-motion`.
- Every surface or text color change must be checked in both `data-theme="light"` and `data-theme="dark"`.
- Maintain responsive behavior. The desktop reading rail may collapse; narrow screens should prioritize the article and must not create horizontal overflow.

## CSS ownership

- `app/styles/base.css` — design tokens, reset, body, global header, theme and accessibility media queries.
- `app/styles/home.css` — Home hero and shared article-card presentation.
- `app/styles/content.css` — Archive, About, article header, TOC and rendered MDX prose.

Put a rule in the narrowest owning stylesheet. Reuse existing custom properties before adding a hard-coded color or shadow. Add a light/dark token pair when the value represents a reusable surface.

## Content rules

- Start new posts from `content/templates/post.mdx`.
- Keep post images under `public/images/posts/<slug>/` and commit the MDX and images together.
- Do not expose internal credentials, private domains, employee data, local absolute paths, unannounced product details or unsupported claims.
- Do not add document-control blocks such as internal version baselines, evidence scopes or target-reader metadata to the rendered article body. Put public metadata in frontmatter and begin the body with the article itself.
- `draft: true` is previewable locally but excluded from production.
- `featured` is currently stored metadata only; Home still renders the three newest posts by publication date.

## Change workflow

1. Inspect the current implementation and existing dirty worktree before editing. Preserve unrelated user changes.
2. Make the smallest coherent change using the current architecture.
3. For content changes, run `npm run content:check`.
4. For code or styling changes, run `npm run lint` and `npm test`.
5. Run `npm run build` when changing build configuration, routing, MDX compilation, dependencies or deployment behavior.
6. For visible UI changes, verify the relevant local pages in a browser. Check desktop and narrow layouts; check light and dark themes when colors or surfaces change.
7. Report what was verified separately from what was merely changed.

Do not claim that a local build proves a Vercel deployment. Do not treat a successful deployment as proof of the visual result without page-level verification.

## Git and deployment boundary

The default authorization is local editing and local verification only.

- Do not commit, push, deploy, promote, roll back or change Vercel configuration unless the user explicitly asks for that action.
- When the user asks to commit or push, inspect the diff first and include only the intended project changes.
- Never remove unrelated user files or rewrite repository history to clean the worktree.

## Completion checklist

Before handing off a normal code change:

- no new TypeScript, ESLint or content-check failures;
- no accidental `next/link`, mock article, database or CMS dependency;
- Home, Archive and article list still share the same article-card component;
- article metadata, tags, TOC and MDX rendering remain functional;
- UI remains legible in light and dark mode and usable with keyboard focus;
- the final response states whether anything was committed, pushed or deployed.
