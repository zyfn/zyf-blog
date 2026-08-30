/* eslint-disable @next/next/no-img-element -- vinext's next/image shim breaks React hooks during hydration. */
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About",
  description: "ZYF, Agent Infra Engineer at Alibaba.",
};

export default function AboutPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader active="about" />
      <main className="about-page page-frame">
        <h1 className="visually-hidden">About ZYF</h1>

        <section className="about-profile-layout">
          <aside className="about-person">
            <div className="about-avatar-shell">
              <img src="/images/profile/zyf.jpg" alt="ZYF" />
            </div>
            <strong>ZYF</strong>
            <p>Agent Infra Engineer</p>
            <span>Alibaba</span>
          </aside>

          <div className="about-copy">
            <div className="about-story">
              <p className="about-story-lead">
                Agent Infra Engineer at Alibaba, working across Agent Runtime,
                AI Open Platform, MCP Gateway, and AgentTeam.
              </p>
              <p>
                My work covers the infrastructure around Agents: runtime state,
                context persistence, tool execution, permission boundaries, and
                collaboration across multiple Agents.
              </p>
              <p>
                This blog records the systems, technical decisions, and practical
                lessons behind that work.
              </p>
            </div>

            <a
              aria-label="ZYF on GitHub"
              className="about-github-link"
              href="https://github.com/zyfn"
              rel="noreferrer"
              target="_blank"
            >
              <svg aria-hidden="true" className="about-github-logo" viewBox="0 0 24 24">
                <path d="M12 .7A11.3 11.3 0 0 0 8.43 22.72c.57.1.78-.24.78-.54v-2.1c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.7.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.72-1.54-2.54-.29-5.21-1.27-5.21-5.59 0-1.23.44-2.23 1.17-3.02-.12-.29-.51-1.46.11-3.04 0 0 .95-.3 3.11 1.15a10.8 10.8 0 0 1 5.66 0c2.16-1.46 3.1-1.15 3.1-1.15.63 1.58.24 2.75.12 3.04.73.8 1.17 1.8 1.17 3.02 0 4.33-2.68 5.3-5.23 5.58.41.35.78 1.05.78 2.12v3.15c0 .31.2.65.79.54A11.3 11.3 0 0 0 12 .7Z" />
              </svg>
              <span className="about-github-copy">
                <strong>GitHub</strong>
                <span>github.com/zyfn</span>
              </span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
