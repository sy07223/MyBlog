"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_HEADER_LOGO } from "@/config/site";

export default function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          {SITE_HEADER_LOGO}
        </Link>
        <nav className="site-nav">
          <Link
            href="/"
            className={pathname === "/" ? "nav-link active" : "nav-link"}
          >
            文章
          </Link>
          <Link
            href="/?essay=1"
            className={pathname === "/" ? "nav-link" : "nav-link"}
          >
            随笔
          </Link>
          <Link
            href="/guestbook"
            className={pathname === "/guestbook" ? "nav-link active" : "nav-link"}
          >
            留言板
          </Link>
        </nav>
      </div>
    </header>
  );
}
