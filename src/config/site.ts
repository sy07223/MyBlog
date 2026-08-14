/**
 * 博客站点配置
 * 克隆后请改成自己的信息
 */

export const SITE_DISPLAY_NAME = "Sy 的小站";
export const SITE_HEADER_LOGO = "SY / NOTES";
export const SITE_WELCOME_NICK = "Sy";
export const SITE_TAGLINE = "专注于 Web、产品设计与 Agent 开发的开发者。";
export const SITE_BIO_PARAGRAPHS = [
  "用代码构建产品，也记录关于 AI Agent、设计与开发的探索。",
  "这里展示我正在做的项目，以及那些值得回看的教程和想法。",
];

// 替换 public/avatar.jpg 即可更新头像，不需要修改页面代码。
export const SITE_AVATAR_URL = "/avatar.jpg";

export const SITE_CONTACT_QR: { label: string; qr: string }[] = [];

export type SocialIconName = "github" | "x" | "telegram" | "qq" | "email";

export interface SiteSocialLink {
  label: string;
  href: string;
  icon: SocialIconName;
}

export const SITE_SOCIAL_LINKS: SiteSocialLink[] = [
  { label: "GitHub", href: "https://github.com/sy07223", icon: "github" },
  // 下面这些链接先留空，填入个人主页地址后会自动变为可点击状态。
  { label: "X", href: "", icon: "x" },
  { label: "Telegram", href: "", icon: "telegram" },
  { label: "QQ", href: "", icon: "qq" },
  { label: "Email", href: "", icon: "email" },
];

export const SITE_PROJECTS = [
  {
    name: "MyBlog",
    description: "一个用 Next.js、MDX 和 Tailwind CSS 搭建的个人博客。",
    href: "https://github.com/sy07223/MyBlog",
    tags: ["Next.js", "MDX", "TypeScript"],
    status: "持续迭代",
    role: "设计与开发",
  },
  {
    name: "跃动视界 Flow",
    description:
      "面向工作流定义与执行的独立服务，支持工作流编排、运行监控与节点执行。",
    href: "",
    tags: ["React", "React Flow", "FastAPI", "PostgreSQL"],
    status: "本地开发",
    role: "产品与全栈开发",
  },
  {
    name: "LoveSync",
    description:
      "基于微信原生小程序与云开发的情侣空间，包含任务、礼物、心情、回忆相册和厨房点餐等功能。",
    href: "https://github.com/sy07223/MyLoveNative",
    tags: ["微信小程序", "云开发", "Cloud Functions"],
    status: "开源示例",
    role: "产品与开发",
  },
  {
    name: "Language Learning",
    description: "围绕语言学习体验打造的个人项目。",
    href: "https://github.com/sy07223/lang-learning",
    tags: ["Language Learning", "Product"],
    status: "持续探索",
    role: "产品与开发",
  },
];

export const SITE_REPO_URL = "https://github.com/sy07223/MyBlog";

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
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";

export const GISCUS_CONFIG = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || "",
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "General",
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "",
};
