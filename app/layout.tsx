import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/base.css";
import "./styles/home.css";
import "./styles/content.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const themeInitializer = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("zyf-theme");
      document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
    } catch {
      document.documentElement.dataset.theme = "light";
    }

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".theme-toggle")) return;

      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      try {
        localStorage.setItem("zyf-theme", nextTheme);
      } catch {}
    });
  })();
`;

const readingTraceInitializer = `
  (() => {
    let attempts = 0;

    const normalizedId = (value) => {
      const id = String(value).replace(/^#/, '');
      try { return decodeURIComponent(id); }
      catch { return id; }
    };

    const tocLinks = () => Array.from(document.querySelectorAll('.article-toc nav a[href^="#"]'));

    const groupLabel = (wrapper) => {
      const head = wrapper.querySelector('a[data-depth="2"]');
      return head ? head.textContent.trim() : '';
    };

    const expandGroupOf = (link) => {
      const wrapper = link.closest('.article-toc-group');
      const caret = wrapper && wrapper.querySelector('.article-toc-group-caret');
      if (wrapper && caret && wrapper.dataset.collapsed === 'true') {
        wrapper.dataset.collapsed = 'false';
        caret.setAttribute('aria-expanded', 'true');
        caret.setAttribute('aria-label', '收起「' + groupLabel(wrapper) + '」小节');
      }
    };

    let lockedId = '';

    const setCurrent = (hash) => {
      const currentId = normalizedId(hash);
      tocLinks().forEach((link) => {
        const isCurrent = normalizedId(link.getAttribute('href')) === currentId;
        if (isCurrent) {
          link.setAttribute('aria-current', 'location');
          expandGroupOf(link);
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const caret = target.closest('.article-toc-group-caret');
      if (caret) {
        const wrapper = caret.closest('.article-toc-group');
        if (!wrapper) return;
        const open = wrapper.dataset.collapsed === 'true';
        wrapper.dataset.collapsed = String(!open);
        caret.setAttribute('aria-expanded', String(open));
        caret.setAttribute('aria-label', (open ? '收起' : '展开') + '「' + groupLabel(wrapper) + '」小节');
        return;
      }

      const header = target.closest('.article-toc-header');
      if (header) {
        const toc = header.closest('.article-toc');
        if (toc) {
          const open = toc.dataset.open !== 'true';
          toc.dataset.open = String(open);
          header.setAttribute('aria-expanded', String(open));
          header.setAttribute('aria-label', open ? '收起目录' : '展开目录');
        }
        return;
      }

      const link = target.closest('.article-toc nav a[href^="#"]');
      if (link) {
        lockedId = normalizedId(link.getAttribute('href'));
        setCurrent(link.getAttribute('href'));
      }
    });

    const initializeReadingTrace = () => {
      const toc = document.querySelector('.article-toc');
      const handle = toc?.querySelector('.article-toc-header');
      if (!toc || !handle) {
        if (/^\\/posts\\/[^/]+/.test(location.pathname) && attempts < 20) {
          attempts += 1;
          setTimeout(initializeReadingTrace, 100);
        }
        return;
      }

      const setOpen = (open) => {
        toc.dataset.open = String(open);
        handle.setAttribute('aria-expanded', String(open));
        handle.setAttribute('aria-label', open ? '收起目录' : '展开目录');
      };

      if (!toc.dataset.ready) {
        setOpen(!window.matchMedia('(max-width: 1120px)').matches);
        toc.dataset.ready = 'true';
      }

      if (!("IntersectionObserver" in window)) return;
      if (initializeReadingTrace.wired) return;
      initializeReadingTrace.wired = true;

      let scrollUpdatePending = false;
      const updateOnScroll = () => {
        if (scrollUpdatePending) return;
        scrollUpdatePending = true;
        requestAnimationFrame(() => {
          scrollUpdatePending = false;
          if (lockedId) {
            setCurrent(lockedId);
            return;
          }
          const threshold = innerHeight * 0.28;
          const sections = tocLinks()
            .map((link) => document.getElementById(normalizedId(link.getAttribute('href'))))
            .filter(Boolean);
          let current = sections[0];
          for (const section of sections) {
            if (section.getBoundingClientRect().top <= threshold) current = section;
            else break;
          }
          if (current) setCurrent('#' + current.id);
        });
      };

      const releaseHashLock = () => {
        if (!lockedId) return;
        lockedId = '';
        updateOnScroll();
      };

      window.addEventListener('scroll', updateOnScroll, { passive: true });
      window.addEventListener('wheel', releaseHashLock, { passive: true });
      window.addEventListener('touchstart', releaseHashLock, { passive: true });
      window.addEventListener('keydown', releaseHashLock);
      window.addEventListener('pointerdown', (event) => {
        if (!(event.target instanceof Element) || !event.target.closest('.article-toc')) releaseHashLock();
      }, { passive: true });
      if (location.hash) {
        lockedId = normalizedId(location.hash);
        setCurrent(location.hash);
      }
      window.addEventListener('hashchange', () => {
        lockedId = normalizedId(location.hash);
        setCurrent(location.hash);
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(initializeReadingTrace, 500), { once: true });
    } else {
      setTimeout(initializeReadingTrace, 500);
    }
  })();
`;

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  title: { default: "ZYF｜工程实践与长期记录", template: "%s｜ZYF" },
  description: "关于 Agent Engineering、开发工具与真实交付的长期记录。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "ZYF",
    title: "ZYF｜工程实践与长期记录",
    description: "关于 Agent Engineering、开发工具与真实交付的长期记录。",
  },
  twitter: {
    card: "summary",
    title: "ZYF｜工程实践与长期记录",
    description: "关于 Agent Engineering、开发工具与真实交付的长期记录。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <script dangerouslySetInnerHTML={{ __html: readingTraceInitializer }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
