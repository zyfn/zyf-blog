# Blog content instructions

When creating or editing an article under `content/`, follow
[`AUTHORING.md`](./AUTHORING.md) as the publishing contract.

- Put publishable articles in `content/posts/<slug>.mdx`.
- Start from `content/templates/post.mdx`; never copy frontmatter from memory.
- Keep article images in `public/images/posts/<slug>/`.
- Run `npm run content:check` before considering content complete.
- Do not publish internal credentials, private URLs, employee data, local absolute paths, or unverified product claims.
- Do not add arbitrary React imports or raw HTML to an article. Add a reviewed shared MDX component instead.

