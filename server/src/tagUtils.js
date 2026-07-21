/** @returns {string[]} */
export function tagsToArray(tags) {
  if (!tags || typeof tags !== 'string') return []
  return tags
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * @param {unknown} input
 * @returns {{ ok: true, value: string | null } | { ok: false, error: string }}
 */
export function normalizeTagsInput(input) {
  if (input == null || input === '') return { ok: true, value: null }
  const parts = Array.isArray(input) ? input : String(input).split(',')
  const out = []
  for (const p of parts) {
    const t = p.trim()
    if (!t) continue
    if (t.includes(',')) {
      return { ok: false, error: '单个标签不能包含英文逗号' }
    }
    if (t.length > 48) {
      return { ok: false, error: '单个标签过长' }
    }
    out.push(t)
  }
  const unique = [...new Set(out)].slice(0, 24)
  if (unique.length === 0) return { ok: true, value: null }
  return { ok: true, value: unique.join(',') }
}

/** MySQL LIKE with ESCAPE '!' */
export function likeContainsPattern(q) {
  const s = String(q)
    .replace(/!/g, '!!')
    .replace(/%/g, '!%')
    .replace(/_/g, '!_')
  return `%${s}%`
}
