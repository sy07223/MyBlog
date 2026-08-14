import { SITE_URL } from "@/config/site";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
