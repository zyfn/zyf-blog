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

          <div className="about-story">
            <p>
              I&apos;m ZYF, an Agent Infra Engineer at Alibaba. My work spans
              Agent Runtime, AI Open Platform, MCP Gateway, and AgentTeam.
            </p>
            <p>
              I care about the systems around an Agent: its runtime, state,
              permissions, tools, collaboration model, and the evidence required
              to ship reliable software.
            </p>
            <p>
              This site is where I publish engineering notes, practical decisions,
              and lessons from building Agent infrastructure.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
