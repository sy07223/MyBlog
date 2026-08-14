import type { Metadata } from "next";
import Link from "next/link";
import {
  SITE_BIO_PARAGRAPHS,
  SITE_DISPLAY_NAME,
  SITE_SOCIAL_LINKS,
  SITE_TAGLINE,
} from "@/config/site";
import SocialLinks from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "关于",
  description: "关于这个博客和作者。",
};

export default function AboutPage() {
  return (
    <div className="content-page">
      <section className="page-hero glass-panel">
        <p className="post-eyebrow">ABOUT THIS SPACE</p>
        <h1>{SITE_DISPLAY_NAME}</h1>
        <p className="page-lead">{SITE_TAGLINE}</p>
      </section>

      <div className="about-grid">
        <article className="content-card glass-panel">
          <p className="section-eyebrow">你好，很高兴认识你</p>
          <h2>用代码做一些有意思的事</h2>
          {SITE_BIO_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            这个站点会持续收录 Web 开发、产品设计与 AI Agent 的实践，也会记录一些教程、阅读思考和生活随笔。如果你发现了有趣的内容，欢迎通过留言板或社交平台联系我。
          </p>
          <div className="about-actions">
            <Link href="/guestbook" className="btn">
              去留言
            </Link>
            <Link href="/projects" className="btn ghost">
              看项目
            </Link>
          </div>
        </article>

        <aside className="content-card glass-panel about-aside">
          <p className="section-eyebrow">CONNECT</p>
          <h2>找到我</h2>
          <p>欢迎关注我的开源项目和后续更新。</p>
          <SocialLinks />
          {SITE_SOCIAL_LINKS.length === 0 && (
            <p className="muted-note">社交链接还未配置。</p>
          )}
        </aside>
      </div>
    </div>
  );
}
