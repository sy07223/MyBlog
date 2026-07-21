import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_DISPLAY_NAME, SITE_TAGLINE } from "@/config/site";
import SiteHeader from "@/components/SiteHeader";
import BlogBackground from "@/components/BlogBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: SITE_DISPLAY_NAME,
    template: `%s | ${SITE_DISPLAY_NAME}`,
  },
  description: SITE_TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <BlogBackground />
        <SiteHeader />
        <main className="app-shell with-header">{children}</main>
      </body>
    </html>
  );
}
