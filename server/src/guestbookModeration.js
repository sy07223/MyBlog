/**
 * 留言自动审核：敏感词（环境变量）+ 简单反垃圾规则，不通过则拒绝发表。
 * GUESTBOOK_BLOCKED_WORDS：逗号或中文逗号分隔，子串匹配（昵称与正文均检查）。
 */
export function autoModerateGuestbook(nickname, content) {
  const combined = `${nickname}\n${content}`
  const lowerAscii = combined.toLowerCase()

  if (/<\s*script[\s>/]/i.test(combined) || /javascript:\s*/i.test(lowerAscii)) {
    return { ok: false, message: '内容未通过自动审核' }
  }

  const urlMatches = content.match(/https?:\/\/[^\s]+/gi) || []
  if (urlMatches.length > 2) {
    return { ok: false, message: '链接过多，请精简后再试' }
  }

  const raw = process.env.GUESTBOOK_BLOCKED_WORDS || ''
  const words = raw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)

  for (const w of words) {
    if (combined.includes(w)) {
      return { ok: false, message: '内容未通过自动审核' }
    }
    if (/[a-zA-Z]/.test(w) && lowerAscii.includes(w.toLowerCase())) {
      return { ok: false, message: '内容未通过自动审核' }
    }
  }

  return { ok: true }
}
