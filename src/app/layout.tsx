import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_DISPLAY_NAME, SITE_TAGLINE, SITE_URL } from "@/config/site";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_DISPLAY_NAME,
    template: `%s | ${SITE_DISPLAY_NAME}`,
  },
  description: SITE_TAGLINE,
  keywords: [
    "个人博客",
    "Next.js",
    "MDX",
    "Agent 开发",
    "技术文章",
    "随笔",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: SITE_DISPLAY_NAME,
    title: SITE_DISPLAY_NAME,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary",
    title: SITE_DISPLAY_NAME,
    description: SITE_TAGLINE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <SiteHeader />
        <main className="app-shell with-header">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
