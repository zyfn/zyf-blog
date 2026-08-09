# NOTES.

一个可持续发布文章、教程与长期笔记的通用博客。

## 能力

- 首页、文章归档、专题筛选、全文关键词搜索与 Markdown 阅读页
- 上传 `.md`、`.markdown`、`.txt`，或直接在浏览器中撰写 Markdown
- 实时预览、草稿、发布、编辑与删除
- Cloudflare D1 持久化文章
- ChatGPT 登录与单一站长写作权限
- Claude Code 与 Codex 白皮书作为首批示例内容

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。本地开发环境会使用模拟作者身份；线上写作后台使用 ChatGPT 登录。

## 校验

```bash
npm run lint
npm test
```

修改 `db/schema.ts` 后运行 `npm run db:generate` 生成迁移。
