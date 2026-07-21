import { Suspense } from "react";
import { getPublishedPosts, getAllTags, filterPosts } from "@/lib/posts";
import PostList from "@/components/PostList";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const allPosts = getPublishedPosts();
  const allTags = getAllTags("post");
  const essayTags = getAllTags("essay");

  const { items, total, pages } = filterPosts(allPosts, {
    page: 1,
    limit: 8,
  });

  const postItems = items.map((p) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
    created_at: p.created_at,
    excerpt: p.excerpt || "",
  }));

  return (
    <Suspense fallback={<div className="text-center py-20">加载中…</div>}>
      <PostList
        initialPosts={postItems}
        initialTotal={total}
        initialPages={pages}
        allTags={allTags}
        essayTags={essayTags}
      />
    </Suspense>
  );
}
