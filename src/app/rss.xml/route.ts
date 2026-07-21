import { getPublishedPosts } from "@/lib/posts";
import { SITE_URL, SITE_DISPLAY_NAME, SITE_TAGLINE } from "@/config/site";

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function excerptFromMarkdown(md: string, max = 300): string {
  if (!md || typeof md !== "string") return "";
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`#>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export async function GET() {
  const posts = getPublishedPosts().slice(0, 50);
  const site = SITE_URL;

  const items = posts
    .map((post) => {
      const link = `${site}/post/${encodeURIComponent(post.slug)}`;
      const desc = escapeXml(excerptFromMarkdown(post.content, 300));
      const pub = new Date(post.created_at).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${pub}</pubDate>
      <description>${desc}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_DISPLAY_NAME)}</title>
    <link>${escapeXml(site)}</link>
    <description>${escapeXml(SITE_TAGLINE)}</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
