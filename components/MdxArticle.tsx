import { Children, isValidElement, type ReactNode } from "react";
import type { MdxContent } from "@/lib/blog";

function Callout({ children, title }: { children?: ReactNode; title?: string }) {
  return (
    <aside className="mdx-callout">
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </aside>
  );
}

function Diagram({ source }: { source: string }) {
  const nodes = Array.from(source.matchAll(/(?:\["([^"]+)"\]|\{"([^"]+)"\})/g)).map((match) => ({
    label: (match[1] ?? match[2]).replace(/<br\s*\/?\s*>/gi, " / ").replaceAll(" · ", " / "),
    decision: Boolean(match[2]),
  }));
  const uniqueNodes = nodes.filter(
    (node, index) => nodes.findIndex((candidate) => candidate.label === node.label) === index,
  );

  return (
    <div className="architecture-visual" role="img" aria-label="能力架构示意图">
      <ol className="architecture-flow">
        {uniqueNodes.map((node) => <li className={node.decision ? "is-decision" : ""} key={node.label}><strong>{node.label}</strong></li>)}
      </ol>
    </div>
  );
}

function CodeFrame({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children)[0];
  if (isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    const className = child.props.className ?? "";
    if (className.includes("language-mermaid")) return <Diagram source={String(child.props.children ?? "")} />;
  }
  return <pre>{children}</pre>;
}

export function MdxArticle({ Content }: { Content: MdxContent }) {
  return (
    <div className="article-prose">
      <Content
        components={{
          Callout,
          a: ({ href, children }: { href?: string; children?: ReactNode }) => {
            const external = href?.startsWith("http");
            return <a href={href} rel={external ? "noreferrer" : undefined} target={external ? "_blank" : undefined}>{children}</a>;
          },
          pre: CodeFrame,
          table: ({ children }: { children?: ReactNode }) => <div className="table-scroll"><table>{children}</table></div>,
        }}
      />
    </div>
  );
}
