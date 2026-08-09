import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  return {
    metadataBase: new URL(baseUrl),
    title: { default: "NOTES.｜文章与教程", template: "%s｜NOTES." },
    description: "一个用于发布文章、教程与长期笔记的轻量博客。",
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: "NOTES.",
      title: "NOTES.｜文章与教程",
      description: "写下值得反复阅读的内容。",
      url: baseUrl,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "NOTES. 文章、教程与长期笔记" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "NOTES.｜文章与教程",
      description: "写下值得反复阅读的内容。",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
