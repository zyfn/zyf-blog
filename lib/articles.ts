import GithubSlugger from "github-slugger";
import claudeWhitepaper from "../content/claude-code-whitepaper.md?raw";
import codexWhitepaper from "../content/codex-whitepaper.md?raw";
import orchestrationGuide from "../content/multi-agent-orchestration.md?raw";
import securityGuide from "../content/sandbox-permission-approval.md?raw";
import skillGuide from "../content/prompt-to-skill.md?raw";

export type Article = {
  slug: string;
  title: string;
  dek: string;
  format: string;
  topic: string;
  tags: string[];
  updated: string;
  readTime: string;
  tone: "orange" | "sage" | "ink" | "sand";
  featured: boolean;
  body: string;
  storedId?: string;
};

export type ArticleSummary = Omit<Article, "body">;

function stripDocumentCover(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const firstDivider = normalized.indexOf("\n---\n");
  return firstDivider >= 0
    ? normalized.slice(firstDivider + "\n---\n".length).trim()
    : normalized.trim();
}

export const articles: Article[] = [
  {
    slug: "claude-code-whitepaper",
    title: "Claude Code 研发 Agent 技术白皮书",
    dek: "从单 Session 闭环、上下文与安全边界，一直走到 Agent Team、Dynamic Workflow 和企业治理。",
    format: "白皮书",
    topic: "Claude Code",
    tags: ["Claude Code", "CLAUDE.md", "Subagent", "Agent Team", "Workflow", "Slash 命令"],
    updated: "2026.08.10",
    readTime: "38 分钟",
    tone: "orange",
    featured: true,
    body: stripDocumentCover(claudeWhitepaper),
  },
  {
    slug: "codex-whitepaper",
    title: "Codex 研发 Agent 技术白皮书",
    dek: "理解 AGENTS.md、Sandbox、Approval、Skills、Subagents、App Server，以及何时走向平台化。",
    format: "白皮书",
    topic: "Codex",
    tags: ["Codex", "AGENTS.md", "Sandbox", "App Server", "SDK", "Slash 命令"],
    updated: "2026.08.10",
    readTime: "31 分钟",
    tone: "sage",
    featured: true,
    body: stripDocumentCover(codexWhitepaper),
  },
  {
    slug: "multi-agent-orchestration",
    title: "多 Agent 编排选型：不要一上来就开团队",
    dek: "从单 Agent、Subagent、并行 Session 到 Team 与 Workflow，用任务形状而不是功能热度做选择。",
    format: "教程",
    topic: "Agent 工程",
    tags: ["多 Agent", "Subagent", "Team", "Workflow", "Worktree"],
    updated: "2026.08.10",
    readTime: "12 分钟",
    tone: "ink",
    featured: true,
    body: orchestrationGuide,
  },
  {
    slug: "sandbox-permission-approval",
    title: "Sandbox、Permission 与 Approval：三道边界",
    dek: "把“能不能做”“要不要先问”“越界时是否真的做得成”拆成三层，避免把安全开关混为一谈。",
    format: "教程",
    topic: "Agent 工程",
    tags: ["Sandbox", "Permission", "Approval", "安全", "治理"],
    updated: "2026.08.10",
    readTime: "9 分钟",
    tone: "sand",
    featured: false,
    body: securityGuide,
  },
  {
    slug: "prompt-to-skill",
    title: "从一条好 Prompt，到一个可维护的 Skill",
    dek: "识别真正值得资产化的流程，并把触发条件、输入、脚本、参考资料和验收做成可复用能力。",
    format: "方法论",
    topic: "Agent 工程",
    tags: ["Prompt", "Skill", "Hook", "MCP", "复用"],
    updated: "2026.08.10",
    readTime: "10 分钟",
    tone: "orange",
    featured: false,
    body: skillGuide,
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

function plainHeading(value: string) {
  return value
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim();
}

export function getArticleToc(markdown: string) {
  const slugger = new GithubSlugger();
  return Array.from(markdown.matchAll(/^##\s+(.+)$/gm)).map((match) => {
    const label = plainHeading(match[1]);
    return { id: slugger.slug(label), label };
  });
}
