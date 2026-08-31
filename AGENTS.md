# AGENTS.md

## 适用范围

本文件是 `zyf-blog` 仓库唯一的项目级 Agent 工程契约，覆盖代码、UI、内容文件、验证、Git 与部署。仓库内不新增更深层的 `AGENTS.md`。

## 产品边界

这是 ZYF 的个人工程博客：

- `/`：个人介绍与最近 3 篇文章；
- `/posts`：全部公开文章与搜索；
- `/posts/<slug>`：MDX 正文、更新时间、标签和可折叠目录；
- `/about`：职业介绍。

除非用户明确改变范围，不新增登录、评论、后台、数据库、CMS、对象存储、统计平台、分类系统或新的一级栏目。文章和图片继续以 Git 仓库为唯一来源。

## 技术架构

- Vinext、Vite、Nitro 承载现有 Next.js App Router 编程模型；不迁移框架。
- 使用 React 19 和严格 TypeScript，页面与数据读取默认使用服务端组件。
- 只有浏览器状态确有必要时才使用 `"use client"`；搜索和打字机是现有例外。主题与目录交互继续使用根布局原生脚本。
- `content/posts` 是唯一文章源，`lib/blog.ts` 通过 `import.meta.glob` 读取 frontmatter 与编译后的 MDX。
- MDX 使用 `remark-gfm`、`rehype-slug`；共享组件只在 `components/MdxArticle.tsx` 注册。
- Vercel 生产输出由 Nitro 和 `vercel.json` 决定。

## 不可破坏的约束

- 内部导航使用原生 `<a>`；不要引入 `next/link`。现有 Vinext 生产链路曾因 Client Reference 兼容问题失败，测试会保护这条边界。
- Home 与 Archive 必须复用 `ArticleCard`，文章列表样式不得分叉。
- 全局导航只在 `SiteHeader` 维护，顺序为 `Home`、`Blog`、`About`。
- 阅读目录只在 `ArticleToc` 维护：桌面端位于左侧阅读轨道、默认展开、可折叠、不可拖拽或记忆任意位置；窄屏位于正文上方并默认收起。
- MDX 共享能力只在 `MdxArticle` 注册；单篇文章不得任意导入 React 组件。
- 当前 React 与 CSS 能完成的交互不新增依赖。
- 保留语义标签、替代文本、键盘焦点、`aria-expanded` 和窄屏滚动能力。

## UI 规范

- 整体采用克制的 Apple 风格编辑设计；文章阅读页接近 OpenAI 工程博客的中性排版。
- 浅色中性背景、单一珊瑚色强调和暗色主题继续保留。
- 毛玻璃只用于明确层级，不给正文、列表和目录普遍套卡片。
- 桌面标题与正文等宽，约占视口 55%，最大约 960px；移动端使用可用宽度。
- 正文以 16–17px、400 字重、约 1.7 行高为基准；H1 不超过约 48px，H2 约 28–32px，H3 约 20–23px。
- 正文层级依靠标题、段落和留白，不使用重复横线。
- 交互必须有 hover、按压和可见焦点反馈；动效使用 `transform` 与 `opacity`，并尊重 `prefers-reduced-motion`。
- 修改布局时检查桌面和窄屏；修改颜色、表面或阴影时同时检查明暗主题；禁止横向溢出。

样式归属：

- `app/styles/base.css`：令牌、重置、背景、导航、主题、无障碍；
- `app/styles/home.css`：首页 Hero 与共用文章列表；
- `app/styles/content.css`：Archive、About、文章头部、目录和正文。

## 内容与资源

新文章从模板开始：

```bash
cp content/templates/post.mdx content/posts/<slug>.mdx
mkdir -p public/images/posts/<slug>
```

约定：

- 文章：`content/posts/<slug>.mdx`；
- 图片：`public/images/posts/<slug>/`；
- slug 使用 lowercase kebab-case；
- 照片和截图优先 WebP/AVIF，图表优先 SVG；
- 图片不得引用仓库外绝对路径；
- MDX 与引用资源必须在同一次提交中进入仓库。

Frontmatter 必须包含 `title`、`date`、`lastmod`、`summary`、`tags`、`featured`、`draft`；日期使用 `YYYY-MM-DD`，`summary` 不超过 180 字符，标签为 1–6 个具体技术主题。

不要公开凭证、个人绝对路径、员工信息、私有域名、内部交接、未公开规划或未经验证的产品结论。

## 验证

按变更范围执行：

- 内容：`npm run content:check`；
- 代码或样式：`npm run lint && npm test`；
- 路由、MDX 编译、依赖、构建或部署配置：`npm run build`；
- 可见 UI：使用本地浏览器检查目标页面；布局覆盖桌面和窄屏，颜色覆盖明暗主题。

本地构建成功不等于已部署，部署成功也不等于页面视觉和交互已验收。最终回复必须分开说明修改、验证、提交、推送和部署状态。

## Git 与部署

- 默认只允许本地修改和本地验证；用户未明确要求时，不提交、不推送、不部署、不回滚。
- 提交或推送前检查差异，只包含本项目预期改动；保留无关的用户修改。
- 不使用破坏性 Git 命令清理工作区。
- Vercel 从 `main` 自动部署；除非用户明确要求，不手动触发或验证部署。
- 生产构建必须通过 `scripts/check-vercel-output.mjs`，禁止发布含未定义 `rsc_exports` 或 `ssr_exports` 的函数产物。

## 完成检查

交付前确认：

- 内容检查、Lint、测试和必要构建通过；
- 没有引入 `next/link`、mock 文章、数据库或 CMS；
- Home 与 Archive 继续复用 `ArticleCard`；
- 元数据、标签、目录和 MDX 渲染有效；
- 明暗主题可读，键盘焦点可见，窄屏无横向溢出；
- 最终回复明确说明是否提交、推送或部署。
