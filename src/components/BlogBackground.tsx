import { BLOG_BG_URL, BLOG_BG_POSTER, isVideoBackgroundUrl } from "@/config/site";

export default function BlogBackground() {
  const isVideoBg = isVideoBackgroundUrl(BLOG_BG_URL);

  return (
    <>
      {isVideoBg ? (
        <video
          className="blog-bg-video"
          src={BLOG_BG_URL}
          poster={BLOG_BG_POSTER.trim() || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
        />
      ) : (
        <div
          className="blog-bg"
          style={{ backgroundImage: `url('${BLOG_BG_URL}')` }}
          role="presentation"
        />
      )}
      <div className="blog-bg-dim" aria-hidden="true" />
    </>
  );
}
