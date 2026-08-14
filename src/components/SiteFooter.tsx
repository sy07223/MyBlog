import Link from "next/link";
import { SITE_DISPLAY_NAME, SITE_TAGLINE } from "@/config/site";
import SocialLinks from "@/components/SocialLinks";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            {SITE_DISPLAY_NAME}
          </Link>
          <p className="footer-tagline">{SITE_TAGLINE}</p>
        </div>
        <div className="footer-nav">
          <Link href="/about">关于</Link>
          <Link href="/projects">项目</Link>
          <Link href="/guestbook">留言</Link>
        </div>
        <SocialLinks compact />
      </div>
      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} {SITE_DISPLAY_NAME}</span>
        <span>Built with Next.js · MDX</span>
      </div>
    </footer>
  );
}
