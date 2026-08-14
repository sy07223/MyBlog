import Link from "next/link";
import type { Post } from "@/lib/posts";

interface RelatedPostsProps {
  posts: Post[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="related-posts" aria-labelledby="related-posts-title">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">继续阅读</p>
          <h2 id="related-posts-title">你可能也会喜欢</h2>
        </div>
        <Link href="/#blog-posts" className="section-link">
          查看全部文章 →
        </Link>
      </div>
      <div className="related-grid">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/post/${post.slug}`}
            className="related-card glass-card"
          >
            <span className="related-date">{post.created_at.slice(0, 10)}</span>
            <h3>{post.title}</h3>
            {post.excerpt && <p>{post.excerpt}</p>}
            <span className="related-read-time">
              阅读约 {post.reading_minutes || 1} 分钟
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
