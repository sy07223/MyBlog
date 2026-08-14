import type { RefObject } from "react";
import Image from "next/image";
import {
  SITE_AVATAR_URL,
  SITE_BIO_PARAGRAPHS,
  SITE_CONTACT_QR,
  SITE_DISPLAY_NAME,
  SITE_SOCIAL_LINKS,
  SITE_TAGLINE,
} from "@/config/site";
import type { PostListItem } from "@/lib/posts";
import SocialLinks from "@/components/SocialLinks";

interface ProfilePanelProps {
  initialPosts: PostListItem[];
  initialTotal: number;
  allTags: string[];
  q: string;
  isEssayMode: boolean;
  showClearFilters: boolean | string;
  tagCloudTags: string[];
  displayedTagCloudTags: string[];
  activeTags: string[];
  tagCloudOverflow: boolean;
  tagsExpanded: boolean;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onApplySearch: () => void;
  onClearFilters: () => void;
  onToggleTag: (tag: string) => void;
  onToggleTags: () => void;
}

export default function ProfilePanel({
  initialPosts,
  initialTotal,
  allTags,
  q,
  isEssayMode,
  showClearFilters,
  tagCloudTags,
  displayedTagCloudTags,
  activeTags,
  tagCloudOverflow,
  tagsExpanded,
  searchInputRef,
  onApplySearch,
  onClearFilters,
  onToggleTag,
  onToggleTags,
}: ProfilePanelProps) {
  const hasContactLinks =
    SITE_CONTACT_QR.length > 0 || SITE_SOCIAL_LINKS.length > 0;

  return (
    <div className="intro glass-panel profile-panel">
      <header className="blog-list-header profile-header">
        {SITE_AVATAR_URL && (
          <Image
            className="profile-avatar"
            src={SITE_AVATAR_URL}
            width={96}
            height={96}
            alt={`${SITE_DISPLAY_NAME}头像`}
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
          <div className="profile-stats" aria-label="博客统计">
            <div>
              <strong>{initialTotal}</strong>
              <span>篇文章</span>
            </div>
            <div>
              <strong>{allTags.length}</strong>
              <span>个主题</span>
            </div>
            <div>
              <strong>{initialPosts[0]?.created_at.slice(0, 4) || "—"}</strong>
              <span>开始记录</span>
            </div>
          </div>
          {hasContactLinks && (
            <div className="profile-links profile-contact-links">
              {SITE_CONTACT_QR.map((contact) => (
                <div key={contact.label} className="qr-chip-wrap">
                  <button type="button" className="profile-link qr-trigger">
                    {contact.label}
                  </button>
                  <div className="qr-popover" role="dialog">
                    <Image
                      className="qr-popover-img"
                      src={contact.qr}
                      width={168}
                      height={168}
                      loading="lazy"
                      alt={`${contact.label}二维码`}
                    />
                  </div>
                </div>
              ))}
              <SocialLinks includeRss={false} />
            </div>
          )}
        </div>
      </header>

      <div className="toolbar">
        <div className="search-row">
          <input
            key={q}
            ref={searchInputRef}
            defaultValue={q}
            className="search-input"
            type="search"
            placeholder={isEssayMode ? "搜索随笔正文…" : "搜索标题或正文…"}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onApplySearch();
              }
            }}
          />
          <button type="button" className="btn" onClick={onApplySearch}>
            {isEssayMode ? "搜随笔" : "搜索"}
          </button>
          {showClearFilters && (
            <button type="button" className="btn ghost" onClick={onClearFilters}>
              清除筛选
            </button>
          )}
        </div>

        {tagCloudTags.length > 0 && (
          <div className="tag-cloud-wrap">
            <div className="tag-cloud">
              <span className="tag-label">
                {isEssayMode ? "随笔里的标签（可多选）" : "文章标签（可多选）"}
              </span>
              {displayedTagCloudTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`cloud-tag ${activeTags.includes(tag) ? "on" : ""}`}
                  onClick={() => onToggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            {tagCloudOverflow && (
              <button type="button" className="tag-cloud-toggle" onClick={onToggleTags}>
                {tagsExpanded ? "收起标签" : `展开全部（${tagCloudTags.length} 个）`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
