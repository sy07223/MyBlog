"use client";

import { useEffect, useState } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null
  );

  useEffect(() => {
    async function compileMdx() {
      try {
        const compiled = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [],
            rehypePlugins: [],
          },
        });
        setMdxSource(compiled);
      } catch (e) {
        console.error("MDX compile error:", e);
      }
    }
    compileMdx();
  }, [content]);

  if (!mdxSource) {
    return <div className="post-content">加载中…</div>;
  }

  return (
    <div className="post-content">
      <MDXRemote {...mdxSource} />
    </div>
  );
}
