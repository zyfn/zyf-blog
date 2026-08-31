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

    const initializeReadingTrace = () => {
      const links = Array.from(document.querySelectorAll('.article-toc nav a[href^="#"]'));
      if (!links.length) {
        if (/^\\/posts\\/[^/]+/.test(location.pathname) && attempts < 20) {
          attempts += 1;
          setTimeout(initializeReadingTrace, 100);
        }
        return;
      }

      const toc = document.querySelector('.article-toc');
      const handle = toc?.querySelector('.article-toc-header');
      if (toc && handle) {
        const setOpen = (open) => {
          toc.dataset.open = String(open);
          handle.setAttribute('aria-expanded', String(open));
          handle.setAttribute('aria-label', open ? '收起目录' : '展开目录');
        };

        setOpen(!window.matchMedia('(max-width: 1120px)').matches);
        toc.dataset.ready = 'true';
        handle.addEventListener('click', (event) => {
          event.preventDefault();
          setOpen(toc.dataset.open !== 'true');
        });
      }

      if (!("IntersectionObserver" in window)) return;

      const normalizedId = (value) => {
        const id = value.replace(/^#/, '');
        try { return decodeURIComponent(id); }
        catch { return id; }
      };

      const sections = links
        .map((link) => document.getElementById(normalizedId(link.hash)))
        .filter(Boolean);

      let lockedId = '';

      const setCurrent = (id) => {
        const currentId = normalizedId(id);
        links.forEach((link) => {
          if (normalizedId(link.hash) === currentId) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      };

      const updateFromPosition = () => {
        if (lockedId) {
          setCurrent(lockedId);
          return;
        }

        const threshold = innerHeight * 0.28;
        let current = sections[0];
        for (const section of sections) {
          if (section.getBoundingClientRect().top <= threshold) current = section;
          else break;
        }
        if (current) setCurrent(current.id);
      };

      let scrollUpdatePending = false;
      const updateOnScroll = () => {
        if (scrollUpdatePending) return;
        scrollUpdatePending = true;
        requestAnimationFrame(() => {
          scrollUpdatePending = false;
          updateFromPosition();
        });
      };

      const releaseHashLock = () => {
        if (!lockedId) return;
        lockedId = '';
        updateOnScroll();
      };

      const observer = new IntersectionObserver(updateFromPosition, {
        rootMargin: '-18% 0px -68% 0px',
        threshold: 0,
      });

      sections.forEach((section) => observer.observe(section));
      links.forEach((link) => link.addEventListener('click', () => {
        lockedId = normalizedId(link.hash);
        setCurrent(lockedId);
      }));
      window.addEventListener('scroll', updateOnScroll, { passive: true });
      window.addEventListener('wheel', releaseHashLock, { passive: true });
      window.addEventListener('touchstart', releaseHashLock, { passive: true });
      window.addEventListener('keydown', releaseHashLock);
      window.addEventListener('pointerdown', (event) => {
        if (!(event.target instanceof Element) || !event.target.closest('.article-toc')) releaseHashLock();
      }, { passive: true });
      if (location.hash) {
        lockedId = normalizedId(location.hash);
        setCurrent(lockedId);
      }
      window.addEventListener('hashchange', () => {
        lockedId = normalizedId(location.hash);
        setCurrent(lockedId);
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
