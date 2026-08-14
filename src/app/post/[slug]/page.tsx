import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/lib/posts";
import PostContent from "@/components/PostContent";
import CopyLinkButton from "@/components/CopyLinkButton";
import RelatedPosts from "@/components/RelatedPosts";
import ReadingProgress from "@/components/ReadingProgress";
import { SITE_DISPLAY_NAME, SITE_URL } from "@/config/site";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "文章不存在" };
  }

  const url = `${SITE_URL}/post/${encodeURIComponent(post.slug)}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/post/${encodeURIComponent(post.slug)}` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: SITE_DISPLAY_NAME,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post);
  const isEssay = post.tags.includes("随笔");

  return (
    <div className="post-detail">
      <ReadingProgress />
      <Link
        href={isEssay ? "/?essay=1#blog-posts" : "/#blog-posts"}
        className="post-back-link"
      >
        ← 返回文章列表
      </Link>
      <article className="glass-panel post-article">
        <header className="post-header">
          <div className="post-eyebrow">{isEssay ? "随笔" : "文章"}</div>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span>发布于 {post.created_at.slice(0, 10)}</span>
            {post.updated_at && post.updated_at !== post.created_at && (
              <span>更新于 {post.updated_at.slice(0, 10)}</span>
            )}
            <span>阅读约 {post.reading_minutes || 1} 分钟</span>
          </div>
          {post.tags.length > 0 && (
            <div className="blog-tags justify-center mt-4">
              {post.tags.map((tag) => (
                <span key={tag} className="feature-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="post-actions">
            <CopyLinkButton />
          </div>
        </header>
        <PostContent content={post.content} />
      </article>
      <RelatedPosts posts={relatedPosts} />
    </div>
  );
}
