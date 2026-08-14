import Link from "next/link";
import {
  SITE_SOCIAL_LINKS,
  type SocialIconName,
  type SiteSocialLink,
} from "@/config/site";

interface SocialLinksProps {
  compact?: boolean;
  includeRss?: boolean;
}

function SocialIcon({ name }: { name: SocialIconName | "rss" }) {
  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.964 6.817H1.684l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
      </svg>
    );
  }

  if (name === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m21.7 3.3-3.25 15.34c-.25 1.08-.9 1.35-1.83.84l-5.07-3.74-2.45 2.36c-.27.27-.5.5-1.02.5l.36-5.16 9.4-8.49c.41-.36-.09-.56-.64-.2L5.58 11.99.6 10.43c-1.08-.34-1.1-1.08.23-1.6L20.3 1.26c.9-.33 1.69.2 1.4 2.04Z" />
      </svg>
    );
  }

  if (name === "qq") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.4 5.2h9.2c2.15 0 3.9 1.75 3.9 3.9v3.05c0 2.15-1.75 3.9-3.9 3.9h-2.9l-3.2 2.6.72-2.6H7.4c-2.15 0-3.9-1.75-3.9-3.9V9.1c0-2.15 1.75-3.9 3.9-3.9Z" />
        <circle cx="9" cy="10.5" r="1" fill="var(--color-surface)" />
        <circle cx="15" cy="10.5" r="1" fill="var(--color-surface)" />
      </svg>
    );
  }

  if (name === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 5.5h17c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5h-17C2.67 18.5 2 17.83 2 17V7c0-.83.67-1.5 1.5-1.5Zm.24 2.2 7.45 5.44a1.35 1.35 0 0 0 1.62 0l7.45-5.44V7H3.74v.7Z" />
      </svg>
    );
  }

  if (name === "rss") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5.5A1.5 1.5 0 1 0 5 8.5a1.5 1.5 0 0 0 0-3Zm-1.5 5.75v2.5A6.75 6.75 0 0 1 10.75 20h2.5A9.25 9.25 0 0 0 3.5 10.75ZM3.5 4v2.5C10.13 6.5 15.5 11.87 15.5 18.5H18C18 10.49 11.51 4 3.5 4Z" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.18c-3.22.7-3.9-1.55-3.9-1.55-.53-1.38-1.3-1.75-1.3-1.75-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.45-2.3 1.2-3.11-.12-.3-.52-1.48.11-3.07 0 0 .98-.31 3.16 1.19a10.93 10.93 0 0 1 5.75 0c2.18-1.5 3.16-1.19 3.16-1.19.63 1.59.23 2.77.11 3.07.75.81 1.2 1.84 1.2 3.11 0 4.45-2.71 5.43-5.29 5.72.41.35.78 1.04.78 2.1v3.12c0 .31.21.67.8.55A11.5 11.5 0 0 0 12 .5Z" />
      </svg>
    );
  }

  return null;
}

function SocialLinkContent({ link }: { link: SiteSocialLink }) {
  return (
    <>
      <span className="social-icon" aria-hidden="true">
        <SocialIcon name={link.icon} />
      </span>
      <span>{link.label}</span>
    </>
  );
}

export default function SocialLinks({
  compact = false,
  includeRss = true,
}: SocialLinksProps) {
  return (
    <div className={`social-links ${compact ? "social-links-compact" : ""}`}>
      {SITE_SOCIAL_LINKS.map((link) =>
        link.href ? (
          <a
            key={link.href + link.label}
            className="social-link"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SocialLinkContent link={link} />
          </a>
        ) : (
          <span
            key={link.label}
            className="social-link is-disabled"
            title={`${link.label}链接待配置`}
          >
            <SocialLinkContent link={link} />
          </span>
        )
      )}
      {includeRss && (
        <Link className="social-link" href="/rss.xml">
          <span className="social-icon" aria-hidden="true">
            <SocialIcon name="rss" />
          </span>
          <span>RSS</span>
        </Link>
      )}
    </div>
  );
}
