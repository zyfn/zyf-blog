# 项目级 Agent 协作规范

本文件是 `zyf-blog` 唯一的 Agent 工作契约，覆盖代码、UI、内容、验证、Git 与部署。仓库内不再维护更深层的 `AGENTS.md` 或独立写作规范；修改任何文件前都以本文件为准。

## 1. 产品边界

这是 ZYF 的个人工程博客，公开信息架构保持克制：

- `/`：个人介绍与最近发布的 3 篇文章；
- `/posts`：全部公开文章与标题、摘要、标签搜索；
- `/posts/<slug>`：MDX 正文、标签、更新时间和可折叠阅读目录；
- `/about`：简洁的职业介绍。

除非用户明确改变产品范围，不新增控制台、后台管理、分类系统、评论、登录、数据库、CMS、对象存储、统计平台或新的一级栏目。文章与图片继续使用 Git 仓库作为唯一来源。

## 2. 技术与架构

- 使用 Vinext、Vite、Nitro 承载现有 Next.js App Router 编程模型，不迁移框架。
- 使用 React 19 与严格 TypeScript。页面和数据读取默认使用服务端组件。
- 只有需要 React 浏览器状态的组件才添加 `"use client"`，当前仅限搜索和打字机。主题切换使用根布局的原生事件脚本，目录折叠使用原生 `<details>`，避免增加 Vinext 的 RSC Client Reference。
- `content/posts` 是唯一文章源。`lib/blog.ts` 通过 `import.meta.glob` 同时读取原始 frontmatter 与已编译 MDX，不引入第二套内容状态。
- Markdown 使用 MDX、`remark-gfm` 与 `rehype-slug`。共享组件统一注册在 `components/MdxArticle.tsx`。
- 生产构建通过 Nitro 输出到 Vercel，构建入口以 `vercel.json` 为准。

## 3. 导航兼容性

内部导航继续使用原生 `<a>`。不要直接引入 `next/link`：当前 Vinext 客户端运行时曾在 Vercel 环境出现模块错误，现有测试会保护这条边界。只有先证明当前构建与部署链路已兼容，才能讨论替换。

## 4. 组件约束

- Home 与 Archive 复用 `ArticleCard`，文章展示样式不得分叉。
- 全局导航只在 `SiteHeader` 中维护，顺序固定为 `Home`、`Blog`、`About`。
- 阅读目录行为只在 `ArticleToc` 中维护，必须保持键盘可用、内部可滚动、可折叠，并正确暴露 `aria-expanded`。
- MDX 共享能力只在 `MdxArticle` 中注册。文章内不得导入任意 React 组件。
- 优先使用 `header`、`nav`、`main`、`article`、`aside`、`section` 等语义元素，并保留可理解的标签、替代文本、焦点状态和 ARIA 状态。
- 当前 React 与 CSS 足以实现的交互不新增依赖。

## 5. 全局视觉规范

整体方向是克制的 Apple 风格编辑设计，不是装饰性毛玻璃展示页。

- 保留浅色中性背景、单一珊瑚色强调、轻微冷暖环境色与现有暗色主题。
- 毛玻璃只用于表达层级，不给每个元素套卡片，也不叠加多层透明表面。
- 大标题使用紧凑字距与行高；正文保持舒适行高，文章行宽约 65–76 个字符。
- 所有可交互元素都要有即时 hover、按压和键盘焦点反馈。
- 动效优先使用 `transform` 与 `opacity`，并尊重 `prefers-reduced-motion`。
- 修改颜色、表面或阴影时同时检查浅色与暗色主题。
- 桌面端可使用阅读轨道，窄屏优先正文，禁止产生横向溢出。

样式归属：

- `app/styles/base.css`：设计令牌、全局重置、页面背景、导航、主题与无障碍媒体查询；
- `app/styles/home.css`：首页 Hero 与共用文章卡片；
- `app/styles/content.css`：Archive、About、文章头部、目录和 MDX 正文。

规则应放到最窄的归属文件。优先复用 CSS 变量；可复用表面必须成对提供浅色与暗色令牌，不随意硬编码新颜色和阴影。

## 6. MDX 文件与资源

新文章必须从 `content/templates/post.mdx` 开始：

```bash
cp content/templates/post.mdx content/posts/<slug>.mdx
mkdir -p public/images/posts/<slug>
```

目录约定：

```text
content/posts/<slug>.mdx
public/images/posts/<slug>/cover.webp
public/images/posts/<slug>/architecture.svg
```

- slug 使用 lowercase kebab-case，文章文件与图片目录保持相同 slug。
- 截图和照片优先 WebP/AVIF，图表优先 SVG；只有必须无损栅格时才使用 PNG。
- 图片必须位于当前仓库，不引用本地绝对路径或仓库外文件。
- MDX 与所引用图片必须在同一次提交中进入仓库。

## 7. Frontmatter 规范

标准格式：

```yaml
---
title: Article title
date: 2026-08-30
lastmod: 2026-08-30
summary: 一句具体、独立且可用于列表和搜索的摘要。
tags:
  - Agent Runtime
  - Codex
featured: false
draft: true
cover: /images/posts/<slug>/cover.webp
---
```

- `title`、`date`、`lastmod`、`summary`、`tags`、`featured`、`draft` 必填。
- 日期统一使用 `YYYY-MM-DD`。`date` 是首次发布时间；只有内容发生实质更新时才修改 `lastmod`。
- `summary` 不超过 180 个字符，不以“本文介绍”开头。
- 每篇使用 1–6 个具体技术标签，例如 `Codex`、`MCP Gateway`、`Agent Runtime`；不要使用“文章”“分享”“笔记”等内容形式标签。
- `draft: true` 可在本地预览，但生产环境不公开。
- `featured` 当前只是保留的编辑元数据；首页仍按发布日期展示最近 3 篇。
- `cover` 可选；存在时必须位于 `/images/posts/<slug>/`。
- 一般不配置自定义 `slug`，由文件名生成公开路径。

## 8. 正文写作规范

- 正文不写 H1，页面使用 frontmatter 的 `title` 生成唯一 H1。
- 主阅读路径使用 H2；H3/H4 只能属于前面的章节。
- 尽快进入真实问题，避免宽泛行业背景、功能菜单、口号和重复结论。
- 区分已验证事实、基于资料的推断、个人判断与建议。
- 版本敏感的结论要说明校验日期，并尽量引用一手资料。
- 不在正文开头放内部文档控制信息，例如版本基线、证据范围、目标读者或重复摘要；公开元数据放入 frontmatter，正文直接进入文章。
- 不公开凭证、员工信息、私有域名、本机绝对路径、未公开规划、内部交接文字或未经验证的产品结论。

## 9. Markdown、表格与代码

支持标准 Markdown、GFM 表格、任务列表、删除线、自动链接、引用和 fenced code。

- 每个代码围栏必须声明语言。
- 表格只用于精确映射和对比；单元格变成段落时应拆分内容。
- 宽表格在窄屏会横向滚动，但仍需检查移动端可读性。
- 不支持 Mermaid 围栏；架构图应导出为 SVG、PNG 或 WebP 后通过图片或 `Figure` 发布。
- 原始 HTML 注释在 MDX 中无效；确有必要时使用 `{/* comment */}`。

## 10. 图片与已批准组件

普通图片：

```md
![Codex Runtime architecture](/images/posts/codex-agent-runtime/architecture.webp)
```

带说明的图片：

```mdx
<Figure
  src="/images/posts/codex-agent-runtime/architecture.svg"
  alt="展示 Agent Loop 与控制边界的 Codex Runtime 架构"
  caption="模型提出行动，Runtime 负责执行、约束和记录。"
/>
```

- `alt` 描述图片承载的信息，不写“这是一张图片”。
- `caption` 解释读者为什么需要观察该图，不重复 alt。
- 关键解释不能只存在于图片中。

目前只批准以下 MDX 组件：

```mdx
<Callout title="边界">
`turn/completed` 证明 Turn 已结束，不证明业务目标已经实现。
</Callout>

<Figure src="/images/posts/example/diagram.svg" alt="可访问描述" caption="可选说明" />
```

需要新能力时，先在 `components/MdxArticle.tsx` 实现可复用组件、补充本规范并通过生产构建，不在单篇文章中临时导入。

## 11. 修改与验证流程

1. 修改前检查当前实现与脏工作区，保留无关的用户改动。
2. 在现有架构内完成最小、完整的变更，不顺手扩张范围。
3. 内容变更至少运行 `npm run content:check`。
4. 代码或样式变更运行 `npm run lint` 和 `npm test`。
5. 修改构建配置、路由、MDX 编译、依赖或部署行为时运行 `npm run build`。
6. 可见 UI 变更必须在本地浏览器检查相关页面；涉及颜色或表面时检查明暗主题，涉及布局时检查桌面和窄屏。
7. 交付时分开说明“已修改”“本地验证”“已部署”，不得混为一谈。

本地构建成功不等于 Vercel 已部署，部署成功也不等于视觉和交互已经通过页面验收。

## 12. Git 与部署边界

默认权限只有本地修改和本地验证：

- 用户未明确要求时，不提交、不推送、不部署、不回滚、不修改 Vercel 配置。
- 用户要求提交或推送时，先检查差异，只包含本项目预期改动。
- 不删除无关文件，不通过改写历史清理脏工作区。
- 生产构建必须通过 `scripts/check-vercel-output.mjs`，禁止发布含未定义 `rsc_exports` 或 `ssr_exports` 的 Vercel 函数产物。

## 13. 完成检查

普通代码任务交付前确认：

- 没有新增 TypeScript、ESLint、内容检查或测试失败；
- 没有意外引入 `next/link`、mock 文章、数据库或 CMS；
- Home 与 Archive 继续复用 `ArticleCard`；
- 文章元数据、标签、目录和 MDX 渲染仍然有效；
- UI 在明暗主题下可读，键盘焦点可见，窄屏没有横向溢出；
- 最终回复明确说明是否执行了提交、推送或部署。
