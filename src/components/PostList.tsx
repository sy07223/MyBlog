"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SITE_DISPLAY_NAME,
  SITE_WELCOME_NICK,
  SITE_TAGLINE,
  SITE_BIO_PARAGRAPHS,
  SITE_AVATAR_URL,
  SITE_CONTACT_QR,
  SITE_SOCIAL_LINKS,
} from "@/config/site";
import type { PostListItem } from "@/lib/posts";

interface PostListProps {
  initialPosts: PostListItem[];
  initialTotal: number;
  initialPages: number;
  allTags: string[];
  essayTags: string[];
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
}: PostListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const q = searchParams.get("q") || "";
  const essay = searchParams.get("essay") === "1";
  const tagParams = searchParams.getAll("tag");

  const activeTags = tagParams.filter(Boolean);
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

  const hasContactLinks =
    SITE_CONTACT_QR.length > 0 || SITE_SOCIAL_LINKS.length > 0;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "8");
      if (q) params.set("q", q);
      if (isEssayMode) params.set("essay", "1");
      for (const tag of activeTags) {
        if (tag !== "随笔") params.append("tag", tag);
      }

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      setPosts(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, q, isEssayMode, activeTags]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

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
    router.push(buildQuery(1, searchDraft, activeTags, isEssayMode));
  }

  function clearFilters() {
    setSearchDraft("");
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
        <section className="hero-welcome" aria-label="欢迎">
          <div className="hero-welcome-inner">
            <h1 className="hero-welcome-title">
              欢迎来到
              <span className="hero-welcome-nick">{SITE_WELCOME_NICK}</span>
              的博客
            </h1>
          </div>
          <button
            type="button"
            className="hero-scroll-cue"
            aria-label="查看正文"
            onClick={() =>
              document
                .getElementById("blog-main")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            <span className="hero-scroll-arrow" aria-hidden="true">
              ⌄
            </span>
          </button>
          <div className="hero-welcome-fade" aria-hidden="true" />
        </section>
      )}

      <div
        id="blog-main"
        className={`inner ${showHero ? "inner-after-hero" : ""}`}
      >
        <div className="intro glass-panel">
          <header className="blog-list-header profile-header">
            {SITE_AVATAR_URL && (
              <img
                className="profile-avatar"
                src={SITE_AVATAR_URL}
                width={96}
                height={96}
                alt=""
              />
            )}
            <div className="profile-text">
              <h2 className="profile-site-heading">{SITE_DISPLAY_NAME}</h2>
              {SITE_TAGLINE && (
                <p className="profile-tagline">{SITE_TAGLINE}</p>
              )}
              {SITE_BIO_PARAGRAPHS.map((line, i) => (
                <p key={i} className="profile-bio">
                  {line}
                </p>
              ))}
              {hasContactLinks && (
                <div className="profile-links">
                  {SITE_CONTACT_QR.map((c) => (
                    <div key={c.label} className="qr-chip-wrap">
                      <button type="button" className="profile-link qr-trigger">
                        {c.label}
                      </button>
                      <div className="qr-popover" role="dialog">
                        <img
                          className="qr-popover-img"
                          src={c.qr}
                          width={168}
                          height={168}
                          loading="lazy"
                          alt={`${c.label}二维码`}
                        />
                      </div>
                    </div>
                  ))}
                  {SITE_SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.href + link.label}
                      className="profile-link"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div className="toolbar">
            <div className="search-row">
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="search-input"
                type="search"
                placeholder={
                  isEssayMode ? "搜索随笔正文…" : "搜索标题或正文…"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applySearch();
                  }
                }}
              />
              <button type="button" className="btn" onClick={applySearch}>
                {isEssayMode ? "搜随笔" : "搜索"}
              </button>
              {showClearFilters && (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={clearFilters}
                >
                  清除筛选
                </button>
              )}
            </div>

            {tagCloudTags.length > 0 && (
              <div className="tag-cloud-wrap">
                <div className="tag-cloud">
                  <span className="tag-label">
                    {isEssayMode
                      ? "随笔里的标签（可多选）"
                      : "文章标签（可多选）"}
                  </span>
                  {displayedTagCloudTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`cloud-tag ${
                        activeTags.includes(t) ? "on" : ""
                      }`}
                      onClick={() => toggleTag(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {tagCloudOverflow && (
                  <button
                    type="button"
                    className="tag-cloud-toggle"
                    onClick={() => setTagsExpanded(!tagsExpanded)}
                  >
                    {tagsExpanded
                      ? "收起标签"
                      : `展开全部（${tagCloudTags.length} 个）`}
                  </button>
                )}
              </div>
            )}
          </div>
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
