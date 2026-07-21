"use client";

import { MDXClient } from "next-mdx-remote-client";
import type { MDXClientProps } from "next-mdx-remote-client";

interface PostContentProps {
  mdxSource: MDXClientProps;
}

export default function PostContent({ mdxSource }: PostContentProps) {
  return (
    <div className="post-content">
      <MDXClient {...mdxSource} />
    </div>
  );
}
