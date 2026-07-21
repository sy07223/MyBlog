"use client";

import Giscus from "@giscus/react";
import { GISCUS_CONFIG } from "@/config/site";

export default function GiscusComments() {
  if (!GISCUS_CONFIG.repo || !GISCUS_CONFIG.repoId) {
    return (
      <div className="text-center py-8 text-[var(--blog-text-muted)]">
        <p>留言功能尚未配置。</p>
        <p className="text-sm mt-2">
          请在 <code>.env.local</code> 中设置{" "}
          <code>NEXT_PUBLIC_GISCUS_REPO</code> 等环境变量。
        </p>
      </div>
    );
  }

  return (
    <Giscus
      id="comments"
      repo={GISCUS_CONFIG.repo as `${string}/${string}`}
      repoId={GISCUS_CONFIG.repoId}
      category={GISCUS_CONFIG.category}
      categoryId={GISCUS_CONFIG.categoryId}
      mapping="pathname"
      term="留言板"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="preferred_color_scheme"
      lang="zh-CN"
      loading="lazy"
    />
  );
}
