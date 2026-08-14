"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SITE_TAGLINE } from "@/config/site";
import type { PostListItem } from "@/lib/posts";
import type { Project } from "@/lib/projects";
import ProfilePanel from "@/components/ProfilePanel";

interface PostListProps {
  initialPosts: PostListItem[];
  initialTotal: number;
  initialPages: number;
  allTags: string[];
  essayTags: string[];
  projects: Project[];
}

const tagGradients = [
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
];

function tagBg(i: number) {
  return tagGradients[i % tagGradients.length];
}

export default function PostList({
  initialPosts,
  initialTotal,
  initialPages,
  allTags,
  essayTags,
  projects,
}: PostListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const q = searchParams.get("q") || "";
  const essay = searchParams.get("essay") === "1";
  const queryString = searchParams.toString();
  const activeTags = useMemo(
    () => new URLSearchParams(queryString).getAll("tag").filter(Boolean),
    [queryString]
  );
  const isEssayMode = essay || activeTags.includes("随笔");
  const TAG_CLOUD_COLLAPSE_AT = 14;

  const tagCloudTags = isEssayMode
    ? essayTags.filter((t) => t !== "随笔")
    : allTags.filter((t) => t !== "随笔");

  const tagCloudOverflow = tagCloudTags.length > TAG_CLOUD_COLLAPSE_AT;
  const displayedTagCloudTags =
    tagCloudOverflow && !tagsExpanded
      ? tagCloudTags.slice(0, TAG_CLOUD_COLLAPSE_AT)
      : tagCloudTags;

  const showHero =
    !isEssayMode && activeTags.length === 0 && !q && page === 1;

  const apiQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "8");
    if (q) params.set("q", q);
    if (isEssayMode) params.set("essay", "1");
    for (const tag of activeTags) {
      if (tag !== "随笔") params.append("tag", tag);
    }
    return params.toString();
  }, [page, q, isEssayMode, activeTags]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts?${apiQuery}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setPosts(data.items);
        setTotal(data.total);
        setPages(data.pages);
      } catch {
        if (!controller.signal.aborted) setLoading(false);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [apiQuery]);

  function buildQuery(
    newPage: number,
    newQ?: string,
    newTags?: string[],
    newEssay?: boolean
  ) {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    if (newQ) params.set("q", newQ);
    if (newEssay) params.set("essay", "1");
    for (const tag of newTags || []) {
      if (tag !== "随笔") params.append("tag", tag);
    }
    const query = params.toString();
    return query ? `/?${query}#blog-posts` : "/#blog-posts";
  }

  function applySearch() {
    const searchDraft = searchInputRef.current?.value.trim() || "";
    router.push(buildQuery(1, searchDraft, activeTags, isEssayMode));
  }

  function clearFilters() {
    if (searchInputRef.current) searchInputRef.current.value = "";
    if (isEssayMode) {
      router.push("/?essay=1#blog-posts");
    } else {
      router.push("/#blog-posts");
    }
  }

  function toggleTag(t: string) {
    const next = new Set(activeTags);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    router.push(buildQuery(1, q, [...next], isEssayMode));
  }

  function goPage(p: number) {
    router.push(buildQuery(p, q, activeTags, isEssayMode));
  }

  const showClearFilters =
    q || (isEssayMode ? activeTags.length > 0 : activeTags.length > 0);

  const selectedProject = projects[0];
  const selectedProjectHref =
    selectedProject?.demo_url || selectedProject?.href || "/projects";

  const emptyListHint = (() => {
    if (loading) return "";
    if (posts.length > 0) return "";
    const tags = activeTags;
    if (isEssayMode && tags.length === 0) {
      return "这里还没有随笔。写文章时打上「随笔」标签，保存后就会出现在此。";
    }
    if (tags.length) {
      const label = tags.map((x) => `「${x}」`).join("");
      if (tags.length > 1) {
        return `暂无同时带有 ${label} 的文章，可少选一个标签试试。`;
      }
      return `暂无带有「${tags[0]}」标签的文章。`;
    }
    if (q) {
      return `没有找到与「${q}」匹配的文章，换个关键词试试。`;
    }
    return "还没有文章。";
  })();

  return (
    <div className="blog-list-view">
      {showHero && (
        <div className="home-top-grid">
          <section className="hero-welcome" aria-label="欢迎">
            <div className="hero-welcome-inner">
              <p className="hero-welcome-kicker">WEB · PRODUCT · AGENT</p>
              <h1 className="hero-welcome-title">
                你好，我是 <span className="hero-welcome-nick">Sy</span>
              </h1>
              <p className="hero-welcome-description">{SITE_TAGLINE}</p>
              <p className="hero-welcome-summary">
                用代码构建产品，也记录关于 AI Agent、设计与开发的探索。
              </p>
              <div className="hero-actions">
                <Link href="/projects" className="btn hero-primary">
                  查看项目 <span aria-hidden="true">↗</span>
                </Link>
                <Link href="#blog-posts" className="btn ghost hero-secondary">
                  阅读文章
                </Link>
              </div>
            </div>
          </section>
          <ProfilePanel
            initialPosts={initialPosts}
            initialTotal={initialTotal}
            allTags={allTags}
            q={q}
            isEssayMode={isEssayMode}
            showClearFilters={showClearFilters}
            tagCloudTags={tagCloudTags}
            displayedTagCloudTags={displayedTagCloudTags}
            activeTags={activeTags}
            tagCloudOverflow={tagCloudOverflow}
            tagsExpanded={tagsExpanded}
            searchInputRef={searchInputRef}
            onApplySearch={applySearch}
            onClearFilters={clearFilters}
            onToggleTag={toggleTag}
            onToggleTags={() => setTagsExpanded(!tagsExpanded)}
          />
        </div>
      )}

      {showHero && initialPosts[0] && (
        <div className="hero-feature-wrap">
          <Link
            href={`/post/${initialPosts[0].slug}`}
            className="hero-feature glass-card"
          >
            <div className="hero-feature-label">
              <span className="status-dot" aria-hidden="true" />
              最新文章
            </div>
            <div className="hero-feature-copy">
              <h2>{initialPosts[0].title}</h2>
              <p>{initialPosts[0].excerpt || "打开文章，看看最近写下了什么。"}</p>
            </div>
            <span className="hero-feature-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
      )}

      <div
        id="blog-main"
        className={`inner ${showHero ? "inner-after-hero" : ""}`}
      >
      {showHero && selectedProject && (
          <section className="home-project" aria-labelledby="home-project-title">
            <div className="section-heading">
              <div>
                <p className="section-eyebrow">SELECTED WORK</p>
                <h2 id="home-project-title">正在做的项目</h2>
              </div>
              <Link href="/projects" className="section-link">
                查看全部项目 →
              </Link>
            </div>
            <Link
              href={selectedProjectHref}
              className="home-project-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="home-project-mark" aria-hidden="true">
                SY
              </div>
              <div className="home-project-copy">
                <p className="project-status">{selectedProject.status}</p>
                <h3>{selectedProject.name}</h3>
                <p>{selectedProject.description}</p>
                <div className="project-tags">
                  {selectedProject.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <span className="home-project-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          </section>
        )}

        {!showHero && (
          <ProfilePanel
            initialPosts={initialPosts}
            initialTotal={initialTotal}
            allTags={allTags}
            q={q}
            isEssayMode={isEssayMode}
            showClearFilters={showClearFilters}
            tagCloudTags={tagCloudTags}
            displayedTagCloudTags={displayedTagCloudTags}
            activeTags={activeTags}
            tagCloudOverflow={tagCloudOverflow}
            tagsExpanded={tagsExpanded}
            searchInputRef={searchInputRef}
            onApplySearch={applySearch}
            onClearFilters={clearFilters}
            onToggleTag={toggleTag}
            onToggleTags={() => setTagsExpanded(!tagsExpanded)}
          />
        )}

        <div className="posts-section-heading">
          <div>
            <p className="section-eyebrow">FROM THE NOTEBOOK</p>
            <h2>{isEssayMode ? "随笔" : "最近的文章"}</h2>
          </div>
          <span className="posts-count">{total} 篇记录</span>
        </div>

        <section
          id="blog-posts"
          className="blog-posts"
          aria-label={isEssayMode ? "随笔列表" : "文章列表"}
        >
          {loading ? (
            <p className="text-center text-[var(--blog-text-muted)]">
              加载中…
            </p>
          ) : emptyListHint ? (
            <p className="list-empty-hint">{emptyListHint}</p>
          ) : (
            <div className="blog-list">
              {posts.map((p, idx) => (
                <article
                  key={p.slug}
                  className="blog-item glass-card"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <Link className="card-link" href={`/post/${p.slug}`}>
                    <div className="blog-header">
                      <span className="blog-date">
                        {p.created_at?.slice(0, 10)}
                      </span>
                    </div>
                    <div className="blog-content">
                      <h2>
                        {isEssayMode && !p.title.trim()
                          ? "随笔片段"
                          : p.title || "未命名"}
                      </h2>
                      {p.excerpt && <p>{p.excerpt}</p>}
                    </div>
                    {p.tags?.length > 0 && (
                      <div className="blog-tags">
                        {p.tags.map((tg, ti) => (
                          <span
                            key={tg}
                            className="feature-tag"
                            style={{ background: tagBg(ti) }}
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}

          {!loading && !emptyListHint && pages > 1 && (
            <nav className="pager" aria-label="分页">
              <button
                type="button"
                className="pg"
                disabled={page <= 1}
                onClick={() => goPage(page - 1)}
              >
                上一页
              </button>
              <span className="pg-info">
                {page} / {pages}（共 {total} 篇）
              </span>
              <button
                type="button"
                className="pg"
                disabled={page >= pages}
                onClick={() => goPage(page + 1)}
              >
                下一页
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
