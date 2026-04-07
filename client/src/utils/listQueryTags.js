/** 从路由 query.tag 解析多选标签（支持 tag=a&tag=b 或单个 tag） */
export function tagsFromRouteQuery(tagQuery) {
  if (tagQuery == null || tagQuery === '') return []
  const arr = Array.isArray(tagQuery) ? tagQuery : [tagQuery]
  return [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))]
}

/** ?essay=1 表示随笔列表（不必再带 tag=随笔） */
export function isEssayQuery(query) {
  const e = query?.essay
  return e === '1' || e === 1 || String(e || '').toLowerCase() === 'true'
}

/** 用于筛选展示与请求：去掉「随笔」，随笔范围由 essay=1 表示 */
export function listTagsFromRoute(tagQuery) {
  return tagsFromRouteQuery(tagQuery).filter((t) => t !== '随笔')
}

/**
 * @param {number} pageNum
 * @param {string} q
 * @param {string[]} tags 不含「随笔」
 * @param {boolean} essay
 */
export function buildListQuery(pageNum, q, tags, essay = false) {
  const out = {}
  if (pageNum > 1) out.page = String(pageNum)
  const qs = q != null && String(q).trim()
  if (qs) out.q = String(q).trim()
  if (essay) out.essay = '1'
  const list = [
    ...new Set((Array.isArray(tags) ? tags : []).map((t) => String(t).trim()).filter(Boolean)),
  ].filter((t) => t !== '随笔')
  if (list.length === 1) out.tag = list[0]
  else if (list.length > 1) out.tag = list
  return out
}
