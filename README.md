# ZYF Blog

ZYF 的个人技术博客，主要记录 Agent Infra、Agent Runtime、AI Open Platform、MCP Gateway 与 AgentTeam 的工程实践。

内容与代码存放在同一个 Git 仓库中：文章使用 MDX，图片使用仓库静态资源，GitHub 保存版本历史，Vercel 在生产分支更新后自动构建站点。项目不依赖数据库、对象存储或第三方 CMS。

## 当前能力

- 首页展示个人信息和最近更新的 3 篇文章。
- `Archive` 展示全部公开文章，并按标题、摘要和标签进行本地搜索。
- 文章页支持 GFM、代码块、表格、图片、Callout、Figure 和自动生成的二级标题目录。
- 阅读目录可独立滚动，也可以收起，为正文释放更多空间。
- 全站支持浅色与暗色模式，选择保存在浏览器本地。
- 页面使用统一的 `Home / Blog / About` 导航和响应式布局。
- 文章、搜索和核心页面具备服务端渲染测试。

## 技术栈

| 层 | 技术 | 用途 |
| --- | --- | --- |
| 应用模型 | Next.js App Router API | 路由、页面、Metadata 与服务端组件模型 |
| 构建运行时 | Vinext + Vite 8 + Nitro | 编译 Next.js 风格应用，并输出 Vercel Functions/静态资源 |
| UI | React 19 + TypeScript | 组件、交互和严格类型检查 |
| 内容 | MDX + YAML frontmatter | 将文章和页面代码放在同一仓库管理 |
| Markdown | remark-gfm + rehype-slug | GFM 表格/列表等语法与标题锚点 |
| 样式 | 原生 CSS | 设计令牌、响应式布局、明暗主题、毛玻璃和交互动效 |
| 字体 | Geist Sans / Geist Mono + Caveat | 正文、代码与首页手写名字 |
| 内容校验 | Node.js 脚本 + YAML | 校验 frontmatter、slug、图片、代码围栏与 MDX 约束 |
| 质量 | ESLint + Node Test Runner | React、TypeScript、可访问性和渲染回归检查 |
| 发布 | GitHub + Vercel | 版本管理、预览部署和生产构建 |

运行环境使用 Node.js 22，具体依赖版本以 [`package.json`](./package.json) 和锁文件为准。

## 工作方式

```text
content/posts/*.mdx
        │
        ├─ import.meta.glob 读取原文和已编译 MDX
        ├─ YAML 解析 frontmatter
        ├─ draft 过滤、日期排序、搜索数据生成
        └─ React 页面渲染
              ├─ /                  首页与最近更新
              ├─ /posts             Archive 与全文元数据搜索
              ├─ /posts/<slug>      文章正文与阅读目录
              └─ /about             个人介绍
```

文章是唯一内容源。构建过程不会把文章同步到数据库，也不会在运行时请求 GitHub API。

## 目录结构

```text
app/
├── layout.tsx                 全局 Metadata、字体与主题初始化
├── page.tsx                   首页入口
├── posts/                     Archive 与文章路由
├── about/                     About 页面
└── styles/                    base、home、content 三层样式

components/
├── BlogHome.tsx               首页内容
├── ArticleExplorer.tsx        Archive 搜索与列表
├── ArticleCard.tsx            首页和 Archive 共用文章卡片
├── ArticleToc.tsx             可滚动、可折叠的阅读目录
├── MdxArticle.tsx             MDX 组件注册表
├── SiteHeader.tsx             全局导航
└── ThemeToggle.tsx            明暗主题切换

content/
├── AUTHORING.md               MDX 发布规范
├── AGENTS.md                  content 目录的 Agent 约束
├── templates/post.mdx         新文章模板
└── posts/<slug>.mdx           可发布文章

lib/
├── blog.ts                    内容读取、frontmatter 解析与排序
└── articles.ts                内容类型与目录提取

public/images/posts/<slug>/    文章图片
scripts/check-content.mjs      内容静态校验
tests/rendered-html.test.mjs   页面与架构回归测试
```

## 编写文章

从模板创建文章，不要凭记忆重写 frontmatter：

```bash
cp content/templates/post.mdx content/posts/<slug>.mdx
mkdir -p public/images/posts/<slug>
```

基本格式：

```mdx
---
title: Agent Runtime 的所有权
date: 2026-08-30
lastmod: 2026-08-30
summary: 环境、状态、权限和证据应该由谁掌握。
tags:
  - Agent Runtime
  - Agent Infra
cover: /images/posts/agent-runtime/cover.webp
featured: false
draft: true
---

## 正文标题

这里开始写正文。

<Callout title="核心判断">
`turn/completed` 只证明一次 Turn 已经结束，不证明业务目标已经实现。
</Callout>
```

重要约束：

- 文件名和图片目录使用相同的 lowercase kebab-case slug。
- `title`、`date`、`lastmod`、`summary`、`tags`、`featured`、`draft` 都是必填字段。
- `cover` 可选；填写时必须位于 `/images/posts/<slug>/`。
- `draft: true` 的文章在开发环境可预览，在生产构建中不会公开。
- `featured` 当前作为保留的编辑属性存入文章元数据，首页仍按发布日期展示最近 3 篇文章。
- 正文不要再写 H1；页面会使用 frontmatter 的 `title` 渲染唯一 H1。
- 图片、表格、代码块和共享 MDX 组件的完整规则见 [`content/AUTHORING.md`](./content/AUTHORING.md)。

## 本地开发

```bash
npm install
npm run dev
```

默认地址通常为 `http://localhost:3000`；端口被占用时开发服务器会选择其他端口，也可以显式传入端口：

```bash
npm run dev -- --port 3001
```

项目当前不需要数据库或内容服务环境变量。

## 校验命令

```bash
npm run content:check  # MDX/frontmatter/资源约束
npm run lint           # TypeScript、React、可访问性与 Next 规则
npm test               # 内容检查、测试构建和 HTML 回归测试
npm run build          # 生成 Vercel 生产产物
```

UI 修改还应在本地浏览器检查首页、Archive、About、文章页，以及浅色、暗色和窄屏状态。

## 发布

仓库远端为 [zyfn/zyf-blog](https://github.com/zyfn/zyf-blog)。Vercel 项目连接 GitHub 后：

- 推送普通分支会生成 Preview Deployment；
- 推送生产分支会触发正式构建；
- Vercel 使用 [`vercel.json`](./vercel.json) 中的 `npm run build`。

发布文章时，MDX 与它引用的图片必须在同一次提交中进入仓库：

```bash
git add content/posts/<slug>.mdx public/images/posts/<slug>
git commit -m "post: publish <slug>"
git push
```

Agent 默认只进行本地修改与验证。只有用户明确要求提交、推送或部署时，才执行对应外部操作。

## 项目约束

- 保持 Git + MDX 的单一内容源，不引入数据库、CMS 或对象存储，除非需求明确改变。
- 内部导航使用原生 `<a>`；当前 Vinext 部署目标曾与 `next/link` 的客户端运行时不兼容。
- 交互组件只在需要状态时使用 Client Component，其余页面保持服务端组件。
- 样式令牌放在 `app/styles/base.css`，首页和内容页面样式分别放在 `home.css` 与 `content.css`。
- 所有新 UI 必须同时适配浅色、暗色、键盘焦点、Reduced Motion 和移动端。
- 项目级 Agent 协作规则见 [`AGENTS.md`](./AGENTS.md)。
