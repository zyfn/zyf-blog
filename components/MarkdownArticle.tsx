import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

function Diagram({ source }: { source: string }) {
  const labels = Array.from(source.matchAll(/\["([^"]+)"\]/g)).map((match) =>
    match[1].replace(/<br\s*\/?\s*>/gi, " · "),
  );
  const uniqueLabels = Array.from(new Set(labels));

  return (
    <div className="architecture-visual" role="img" aria-label="能力架构示意图">
      {uniqueLabels.map((label, index) => (
        <div className="architecture-node" key={`${label}-${index}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
  );
}

function CodeFrame({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children)[0];

  if (isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    const className = child.props.className ?? "";
    if (className.includes("language-mermaid")) {
      return <Diagram source={String(child.props.children ?? "")} />;
    }
  }

  return <pre>{children}</pre>;
}

export function MarkdownArticle({ markdown }: { markdown: string }) {
  return (
    <div className="article-prose">
      <ReactMarkdown
        rehypePlugins={[rehypeSlug]}
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                rel={external ? "noreferrer" : undefined}
                target={external ? "_blank" : undefined}
              >
                {children}
              </a>
            );
          },
          pre: CodeFrame,
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
