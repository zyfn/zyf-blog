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
    let floatingReady = false;

    const initializeReadingTrace = () => {
      const links = Array.from(document.querySelectorAll('.article-toc nav a[href^="#"]'));
      if (!links.length) {
        if (/^\\/posts\\/[^/]+/.test(location.pathname) && attempts < 20) {
          attempts += 1;
          setTimeout(initializeReadingTrace, 100);
        }
        return;
      }
      if (!("IntersectionObserver" in window)) return;

      const toc = document.querySelector('.article-toc');
      const handle = toc?.querySelector('.article-toc-header');
      if (toc && handle && !floatingReady) {
        floatingReady = true;
        setTimeout(() => {
          let dragging = false;
          let moved = false;
          let suppressClick = false;
          let startX = 0;
          let startY = 0;
          let startLeft = 0;
          let startTop = 0;

        const place = (left, top) => {
          const rect = toc.getBoundingClientRect();
          const maxLeft = Math.max(12, innerWidth - rect.width - 12);
          const maxTop = Math.max(12, innerHeight - rect.height - 12);
          toc.style.left = Math.min(Math.max(12, left), maxLeft) + 'px';
          toc.style.top = Math.min(Math.max(12, top), maxTop) + 'px';
          toc.style.right = 'auto';
          toc.style.bottom = 'auto';
        };

          try {
            const saved = JSON.parse(localStorage.getItem('zyf-toc-position-v5') || 'null');
            if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
              place(saved.left, saved.top);
            }
          } catch {}

        handle.addEventListener('pointerdown', (event) => {
          if (event.button !== 0) return;
          const rect = toc.getBoundingClientRect();
          dragging = true;
          moved = false;
          startX = event.clientX;
          startY = event.clientY;
          startLeft = rect.left;
          startTop = rect.top;
          handle.setPointerCapture(event.pointerId);
          toc.dataset.dragging = 'true';
        });

        window.addEventListener('pointermove', (event) => {
          if (!dragging) return;
          const deltaX = event.clientX - startX;
          const deltaY = event.clientY - startY;
          if (!moved && Math.hypot(deltaX, deltaY) < 4) return;
          moved = true;
          place(startLeft + deltaX, startTop + deltaY);
        });

        const finishDrag = (event) => {
          if (!dragging) return;
          dragging = false;
          toc.dataset.dragging = 'false';
          if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
          if (!moved) return;
          suppressClick = true;
          setTimeout(() => { suppressClick = false; }, 250);
          const rect = toc.getBoundingClientRect();
          try {
            localStorage.setItem('zyf-toc-position-v5', JSON.stringify({ left: rect.left, top: rect.top }));
          } catch {}
        };

        window.addEventListener('pointerup', finishDrag);
        window.addEventListener('pointercancel', finishDrag);
        handle.addEventListener('click', (event) => {
          if (suppressClick) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick = false;
            return;
          }
          const open = toc.dataset.open !== 'true';
          toc.dataset.open = String(open);
          handle.setAttribute('aria-expanded', String(open));
          handle.setAttribute('aria-label', open ? '收起目录' : '展开目录');
          if (!open) return;
          setTimeout(() => {
            const rect = toc.getBoundingClientRect();
            place(rect.left, rect.top);
          }, 340);
        });
          window.addEventListener('resize', () => {
            const rect = toc.getBoundingClientRect();
            place(rect.left, rect.top);
          });
        }, 600);
      }

      const normalizedId = (value) => {
        const id = value.replace(/^#/, '');
        try { return decodeURIComponent(id); }
        catch { return id; }
      };

      const sections = links
        .map((link) => document.getElementById(normalizedId(link.hash)))
        .filter(Boolean);

      const setCurrent = (id) => {
        const currentId = normalizedId(id);
        links.forEach((link) => {
          if (normalizedId(link.hash) === currentId) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      };

      const updateFromPosition = () => {
        const threshold = innerHeight * 0.28;
        let current = sections[0];
        for (const section of sections) {
          if (section.getBoundingClientRect().top <= threshold) current = section;
          else break;
        }
        if (current) setCurrent(current.id);
      };

      const observer = new IntersectionObserver((entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
        if (current) setCurrent(current.target.id);
        else updateFromPosition();
      }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });

      sections.forEach((section) => observer.observe(section));
      if (location.hash) setCurrent(location.hash.slice(1));
      window.addEventListener('hashchange', () => setCurrent(location.hash.slice(1)));
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeReadingTrace, { once: true });
    } else {
      initializeReadingTrace();
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
