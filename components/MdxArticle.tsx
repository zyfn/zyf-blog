import Link from "next/link";
import type { ReactNode } from "react";
import type { MdxContent } from "@/lib/blog";

function Callout({ children, title }: { children?: ReactNode; title?: string }) {
  return (
    <aside className="mdx-callout">
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </aside>
  );
}

function Figure({ alt, caption, src }: { alt: string; caption?: string; src: string }) {
  return (
    <figure className="mdx-figure">
      {/* MDX assets have author-controlled dimensions and aspect ratios. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} decoding="async" loading="lazy" src={src} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function MdxArticle({ Content }: { Content: MdxContent }) {
  return (
    <div className="article-prose">
      <Content
        components={{
          Callout,
          Figure,
          a: ({ href, children }: { href?: string; children?: ReactNode }) => {
            if (href?.startsWith("/")) return <Link href={href}>{children}</Link>;
            const external = href?.startsWith("http");
            return <a href={href} rel={external ? "noreferrer" : undefined} target={external ? "_blank" : undefined}>{children}</a>;
          },
          table: ({ children }: { children?: ReactNode }) => <div className="table-scroll"><table>{children}</table></div>,
        }}
      />
    </div>
  );
}
