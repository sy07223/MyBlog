/**
 * 博客站点配置
 * 克隆后请改成自己的信息
 */

export const SITE_DISPLAY_NAME = "我的博客";
export const SITE_HEADER_LOGO = "My Blog";
export const SITE_WELCOME_NICK = "博主";
export const SITE_TAGLINE = "技术笔记与随笔 — 欢迎随便翻翻";
export const SITE_BIO_PARAGRAPHS = [
  "这里是简介第一段，可在 src/config/site.ts 修改。",
  "需要联系方式时，可配置下方二维码或社交链接；不需要则留空数组。",
];

export const SITE_AVATAR_URL = "/avatar.svg";

export const SITE_CONTACT_QR: { label: string; qr: string }[] = [];

export const SITE_SOCIAL_LINKS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com" },
];

export const BLOG_BG_URL = "/blog-bg.svg";
export const BLOG_BG_POSTER = "";

export function isVideoBackgroundUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const path = url.split("?")[0].split("#")[0].toLowerCase();
  return (
    path.endsWith(".mp4") ||
    path.endsWith(".webm") ||
    path.endsWith(".ogg") ||
    path.endsWith(".ogv")
  );
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const GISCUS_CONFIG = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || "",
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "General",
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "",
};
