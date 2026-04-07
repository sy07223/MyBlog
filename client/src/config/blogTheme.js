/**
 * 博客视觉与文案（开源仓库为占位，克隆后请改成自己的）
 */

export const SITE_DISPLAY_NAME = '我的博客'

export const SITE_HEADER_LOGO = 'My Blog'

export const SITE_WELCOME_NICK = '博主'

export const SITE_TAGLINE = '技术笔记与随笔 — 欢迎随便翻翻'

export const SITE_BIO_PARAGRAPHS = [
  '这里是简介第一段，可在 client/src/config/blogTheme.js 修改。',
  '需要联系方式时，可配置下方二维码或社交链接；不需要则留空数组。',
]

/** 使用仓库内 public/avatar.svg，或换成自己的图片路径 */
export const SITE_AVATAR_URL = '/avatar.svg'

/**
 * 微信 / QQ 等二维码：把图片放到 client/public/ 后填写路径。
 * 开源默认留空，避免提交个人二维码。
 * @type {{ label: string, qr: string }[]}
 */
export const SITE_CONTACT_QR = []

/**
 * 外链（新标签打开）
 * @type {{ label: string, href: string }[]}
 */
export const SITE_SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com' },
]

export const BLOG_BG_URL =
  import.meta.env.VITE_BLOG_BG_URL || '/blog-bg.svg'

export const BLOG_BG_POSTER = ''

/** @param {string} url */
export function isVideoBackgroundUrl(url) {
  if (!url || typeof url !== 'string') return false
  const path = url.split('?')[0].split('#')[0].toLowerCase()
  return (
    path.endsWith('.mp4') ||
    path.endsWith('.webm') ||
    path.endsWith('.ogg') ||
    path.endsWith('.ogv')
  )
}
