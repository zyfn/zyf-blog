# ZYF

一个由 GitHub 管理内容、Vercel 自动构建的个人技术博客。

## 内容结构

```text
content/posts/<slug>.mdx
public/images/posts/<slug>/cover.webp
```

文章使用 MDX。页面保留首页、Blog 和 About 三个入口；Blog 搜索会匹配标题、摘要和 tags。

```mdx
---
title: Agent Runtime 的所有权
date: 2026-08-29
lastmod: 2026-08-29
tags:
  - Agent Runtime
  - Agent Infra
summary: 环境、状态、权限和证据应该由谁掌握。
cover: /images/posts/agent-runtime/cover.webp
featured: true
draft: false
---

## 正文标题

这里开始写正文。

<Callout title="核心判断">
MDX 可以直接使用博客预置的 React 组件。
</Callout>
```

字段说明：

- `title`、`date` 必填。
- `tags` 直接决定 Blog 页的 Topics，可配置多个具体技术主题。
- `cover` 使用 `public` 目录下的绝对路径；首页精选必须有封面。
- `featured: true` 将文章设为首页精选。
- `draft: true` 时生产构建不会公开文章。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

默认打开 `http://localhost:3000`。网站只读取 `content/posts`，没有内置示例文章。

## 发布

把 MDX 和图片提交到 GitHub：

```bash
git add content/posts public/images/posts
git commit -m "post: publish article"
git push
```

Vercel 与 GitHub 仓库连接后，推送到生产分支会自动构建并更新正式网站；其他分支会生成预览部署。

## 校验

```bash
npm run lint
npm test
npm run build
```
