import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts, filterPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "8", 10))
  );
  const q = searchParams.get("q") || "";
  const essay = searchParams.get("essay") === "1";
  const tags = searchParams.getAll("tag").filter(Boolean);

  const allPosts = getPublishedPosts();
  const { items, total, pages } = filterPosts(allPosts, {
    page,
    limit,
    q,
    tags,
    essay,
  });

  return NextResponse.json({
    items: items.map((p) => ({
      slug: p.slug,
      title: p.title,
      tags: p.tags,
      created_at: p.created_at,
      excerpt: p.excerpt || "",
    })),
    total,
    page,
    limit,
    pages,
  });
}
