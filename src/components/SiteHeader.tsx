"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SITE_HEADER_LOGO } from "@/config/site";

function SiteHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname.startsWith("/admin");
  const isEssay = pathname === "/" && searchParams.get("essay") === "1";

  if (isAdmin) return null;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          {SITE_HEADER_LOGO}
        </Link>
        <nav className="site-nav" aria-label="主导航">
          <Link
            href="/"
            className={
              pathname === "/" && !isEssay ? "nav-link active" : "nav-link"
            }
            aria-current={pathname === "/" && !isEssay ? "page" : undefined}
          >
            文章
          </Link>
          <Link
            href="/?essay=1"
            className={isEssay ? "nav-link active" : "nav-link"}
            aria-current={isEssay ? "page" : undefined}
          >
            随笔
          </Link>
          <Link
            href="/about"
            className={pathname === "/about" ? "nav-link active" : "nav-link"}
            aria-current={pathname === "/about" ? "page" : undefined}
          >
            关于
          </Link>
          <Link
            href="/projects"
            className={pathname === "/projects" ? "nav-link active" : "nav-link"}
            aria-current={pathname === "/projects" ? "page" : undefined}
          >
            项目
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function SiteHeader() {
  return (
    <Suspense
      fallback={
        <header className="site-header" aria-hidden="true">
          <div className="site-header-inner">
            <span className="site-logo">{SITE_HEADER_LOGO}</span>
          </div>
        </header>
      }
    >
      <SiteHeaderContent />
    </Suspense>
  );
}
