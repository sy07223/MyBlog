import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { Metadata } from "next";
import { serialize } from "next-mdx-remote-client/serialize";
import PostContent from "@/components/PostContent";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const mdxSource = await serialize({
    source: post.content,
    options: {
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    },
  });

  if ("error" in mdxSource) {
    throw mdxSource.error;
  }

  return (
    <div className="post-detail">
      <article className="glass-panel">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span>{post.created_at?.slice(0, 10)}</span>
            {post.reading_minutes && (
              <span>约 {post.reading_minutes} 分钟</span>
            )}
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
        </header>
        <PostContent mdxSource={mdxSource} />
      </article>
    </div>
  );
}
