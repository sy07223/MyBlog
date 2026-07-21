import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    slug: post.slug,
    title: post.title,
    content: post.content,
    tags: post.tags,
    created_at: post.created_at,
    updated_at: post.updated_at,
    reading_minutes: post.reading_minutes,
  });
}
