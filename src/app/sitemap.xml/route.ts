import { getPublishedPosts } from "@/lib/posts";
import { SITE_URL } from "@/config/site";

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = getPublishedPosts();
  const site = SITE_URL;

  const urls = [
    `  <url>
    <loc>${escapeXml(site)}/</loc>
    <changefreq>daily</changefreq>
  </url>`,
    `  <url>
    <loc>${escapeXml(site)}/guestbook</loc>
    <changefreq>weekly</changefreq>
  </url>`,
    `  <url>
    <loc>${escapeXml(site)}/about</loc>
    <changefreq>monthly</changefreq>
  </url>`,
    `  <url>
    <loc>${escapeXml(site)}/projects</loc>
    <changefreq>monthly</changefreq>
  </url>`,
    ...posts.map((post) => {
      const loc = `${site}/post/${encodeURIComponent(post.slug)}`;
      const d = post.updated_at || post.created_at;
      const lastmod = d ? new Date(d).toISOString().slice(0, 10) : "";
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    }),
  ].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
