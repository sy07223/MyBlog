import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../requireAuth.js'
import {
  tagsToArray,
  normalizeTagsInput,
  likeContainsPattern,
} from '../tagUtils.js'

const router = Router()

function excerptFromMarkdown(md, max = 160) {
  if (!md || typeof md !== 'string') return ''
  const text = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`#>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

function readingMinutesFromMarkdown(md) {
  const plain = excerptFromMarkdown(md, 200000)
  if (!plain) return 1
  return Math.max(1, Math.ceil(plain.length / 450))
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function mapListRow(row) {
  const { content, tags: tagStr, ...rest } = row
  return {
    ...rest,
    excerpt: excerptFromMarkdown(content),
    tags: tagsToArray(tagStr),
  }
}

function siteBase(req) {
  return (
    process.env.PUBLIC_SITE_URL ||
    `${req.protocol}://${req.get('host') || 'localhost'}`
  )
}

router.get('/rss.xml', async (req, res) => {
  const site = siteBase(req)
  const [rows] = await pool.query(
    `SELECT title, slug, content, created_at, updated_at
     FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 50`
  )
  const items = rows
    .map((row) => {
      const link = `${site}/post/${encodeURIComponent(row.slug)}`
      const desc = escapeXml(excerptFromMarkdown(row.content, 300))
      const pub = new Date(row.created_at).toUTCString()
      return `    <item>
      <title>${escapeXml(row.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${pub}</pubDate>
      <description>${desc}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(process.env.RSS_TITLE || 'Blog')}</title>
    <link>${escapeXml(site)}</link>
    <description>${escapeXml(process.env.RSS_DESCRIPTION || 'Latest posts')}</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>`
  res.type('application/rss+xml; charset=utf-8')
  res.send(xml)
})

router.get('/sitemap.xml', async (req, res) => {
  const site = siteBase(req)
  const [rows] = await pool.query(
    `SELECT slug, created_at, updated_at FROM posts WHERE published = 1 ORDER BY created_at DESC`
  )
  const urls = [
    `  <url>
    <loc>${escapeXml(site)}/</loc>
    <changefreq>daily</changefreq>
  </url>`,
    ...rows.map((row) => {
      const loc = `${site}/post/${encodeURIComponent(row.slug)}`
      const d = row.updated_at || row.created_at
      const lastmod = d
        ? new Date(d).toISOString().slice(0, 10)
        : ''
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
    }),
  ].join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  res.type('application/xml; charset=utf-8')
  res.send(xml)
})

router.get('/tags', async (req, res) => {
  const scope = typeof req.query.scope === 'string' ? req.query.scope.trim() : ''
  let sql = `SELECT tags FROM posts WHERE published = 1 AND tags IS NOT NULL AND tags != ''`
  const params = []
  if (scope === 'essay') {
    sql += ` AND FIND_IN_SET(?, tags) > 0`
    params.push('随笔')
  } else {
    /** 文章标签云：不包含带「随笔」的帖子，避免与随笔标签混在一起 */
    sql += ` AND FIND_IN_SET(?, tags) = 0`
    params.push('随笔')
  }
  const [rows] = await pool.query(sql, params)
  const set = new Set()
  for (const r of rows) {
    for (const t of tagsToArray(r.tags)) {
      set.add(t)
    }
  }
  const list = [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  res.json({ tags: list })
})

router.get('/posts', async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 10))
  const offset = (page - 1) * limit

  const qRaw = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const q = qRaw.slice(0, 200)
  const tagParam = req.query.tag
  const tagArr = Array.isArray(tagParam)
    ? tagParam
    : tagParam != null && String(tagParam).trim()
      ? [tagParam]
      : []
  let tags = [
    ...new Set(
      tagArr
        .map((x) => String(x).trim().slice(0, 64))
        .filter(Boolean)
    ),
  ]

  const essayFlag =
    String(req.query.essay || '') === '1' ||
    req.query.essay === true ||
    String(req.query.essay || '').toLowerCase() === 'true'
  const hadEssayTag = tags.includes('随笔')
  const essayRequested = essayFlag || hadEssayTag
  if (essayRequested && !tags.includes('随笔')) {
    tags = [...tags, '随笔']
  }

  const whereClauses = ['published = 1']
  const whereParams = []

  if (q) {
    const pattern = likeContainsPattern(q)
    whereClauses.push(
      '(title LIKE ? ESCAPE \'!\' OR content LIKE ? ESCAPE \'!\')'
    )
    whereParams.push(pattern, pattern)
  }
  for (const tag of tags) {
    whereClauses.push('FIND_IN_SET(?, tags) > 0')
    whereParams.push(tag)
  }

  /** 带「随笔」标签的帖子只在随笔筛选下出现，不进默认文章列表 */
  const essayInFilter = essayRequested
  if (!essayInFilter) {
    whereClauses.push(
      '(tags IS NULL OR tags = \'\' OR FIND_IN_SET(?, tags) = 0)'
    )
    whereParams.push('随笔')
  }

  const whereSql = whereClauses.join(' AND ')

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM posts WHERE ${whereSql}`,
    whereParams
  )
  const total = Number(countRows[0].total)

  const [rows] = await pool.query(
    `SELECT id, title, slug, published, created_at, updated_at, content, tags
     FROM posts WHERE ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...whereParams, limit, offset]
  )
  const items = rows.map(mapListRow)
  const pages = Math.max(1, Math.ceil(Number(total) / limit))
  res.json({
    items,
    total: Number(total),
    page,
    limit,
    pages,
  })
})

router.get('/posts/slug/:slug', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, slug, content, created_at, updated_at, tags
     FROM posts WHERE slug = ? AND published = 1 LIMIT 1`,
    [req.params.slug]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Not found' })
  const row = rows[0]
  const { tags: tr, ...rest } = row
  res.json({
    ...rest,
    reading_minutes: readingMinutesFromMarkdown(row.content),
    tags: tagsToArray(tr),
  })
})

const admin = Router()
admin.use(requireAuth)

admin.get('/posts', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, title, slug, published, tags, created_at, updated_at FROM posts ORDER BY created_at DESC'
  )
  res.json(rows)
})

admin.get('/posts/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM posts WHERE id = ? LIMIT 1', [
    req.params.id,
  ])
  if (!rows[0]) return res.status(404).json({ error: 'Not found' })
  res.json(rows[0])
})

admin.post('/posts', async (req, res) => {
  const { title, slug, content, published = 1, tags } = req.body || {}
  if (!title || !slug || content == null) {
    return res.status(400).json({ error: 'title, slug, content required' })
  }
  const tagNorm = normalizeTagsInput(tags)
  if (!tagNorm.ok) {
    return res.status(400).json({ error: tagNorm.error })
  }
  try {
    const [r] = await pool.query(
      `INSERT INTO posts (title, slug, content, published, tags) VALUES (?, ?, ?, ?, ?)`,
      [title, slug, content, published ? 1 : 0, tagNorm.value]
    )
    res.status(201).json({ id: r.insertId })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'slug already exists' })
    }
    throw e
  }
})

admin.put('/posts/:id', async (req, res) => {
  const { title, slug, content, published, tags } = req.body || {}
  if (!title || !slug || content == null) {
    return res.status(400).json({ error: 'title, slug, content required' })
  }
  const tagNorm = normalizeTagsInput(tags)
  if (!tagNorm.ok) {
    return res.status(400).json({ error: tagNorm.error })
  }
  try {
    const [r] = await pool.query(
      `UPDATE posts SET title=?, slug=?, content=?, published=?, tags=? WHERE id=?`,
      [title, slug, content, published ? 1 : 0, tagNorm.value, req.params.id]
    )
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'slug already exists' })
    }
    throw e
  }
})

admin.delete('/posts/:id', async (req, res) => {
  const [r] = await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id])
  if (r.affectedRows === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

router.use('/admin', admin)

export default router
