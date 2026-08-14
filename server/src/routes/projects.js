import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../requireAuth.js'
import { normalizeTagsInput, tagsToArray } from '../tagUtils.js'

const router = Router()

function asText(value, max = 1000) {
  return String(value ?? '').trim().slice(0, max)
}

function asBool(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return fallback
}

function asOrder(value) {
  const n = Number.parseInt(String(value ?? 0), 10)
  return Number.isFinite(n) ? Math.max(0, Math.min(9999, n)) : 0
}

function mapProject(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    role: row.role || '',
    status: row.status || '',
    href: row.href || '',
    demo_url: row.demo_url || '',
    cover_url: row.cover_url || '',
    tags: tagsToArray(row.tags),
    featured: !!row.featured,
    published: !!row.published,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function normalizeProjectInput(body = {}) {
  const name = asText(body.name, 160)
  const slug = asText(body.slug, 160)
  const description = asText(body.description, 4000)
  if (!name || !slug || !description) {
    return { ok: false, error: 'name, slug, description required' }
  }
  if (!/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(slug)) {
    return { ok: false, error: 'slug 只能包含字母、数字、下划线或连字符' }
  }
  const tagNorm = normalizeTagsInput(body.tags)
  if (!tagNorm.ok) return tagNorm

  return {
    ok: true,
    value: {
      name,
      slug,
      description,
      role: asText(body.role, 120),
      status: asText(body.status, 64),
      href: asText(body.href, 1024),
      demo_url: asText(body.demo_url, 1024),
      cover_url: asText(body.cover_url, 1024),
      tags: tagNorm.value,
      featured: asBool(body.featured),
      published: asBool(body.published, true),
      sort_order: asOrder(body.sort_order),
    },
  }
}

router.get('/projects', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, slug, description, role, status, href, demo_url,
              cover_url, tags, featured, published, sort_order, created_at, updated_at
       FROM projects
       WHERE published = 1
       ORDER BY featured DESC, sort_order ASC, updated_at DESC, id DESC`
    )
    res.json({ items: rows.map(mapProject) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '加载项目失败' })
  }
})

const admin = Router()
admin.use(requireAuth)

admin.get('/projects', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, slug, description, role, status, href, demo_url,
              cover_url, tags, featured, published, sort_order, created_at, updated_at
       FROM projects
       ORDER BY featured DESC, sort_order ASC, updated_at DESC, id DESC`
    )
    res.json(rows.map(mapProject))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '加载项目失败' })
  }
})

admin.get('/projects/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ? LIMIT 1',
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(mapProject(rows[0]))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '加载项目失败' })
  }
})

admin.post('/projects', async (req, res) => {
  const normalized = normalizeProjectInput(req.body)
  if (!normalized.ok) return res.status(400).json({ error: normalized.error })
  const p = normalized.value
  try {
    const [result] = await pool.query(
      `INSERT INTO projects
        (name, slug, description, role, status, href, demo_url, cover_url, tags,
         featured, published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.name,
        p.slug,
        p.description,
        p.role || null,
        p.status || null,
        p.href || null,
        p.demo_url || null,
        p.cover_url || null,
        p.tags,
        p.featured ? 1 : 0,
        p.published ? 1 : 0,
        p.sort_order,
      ]
    )
    res.status(201).json({ id: result.insertId })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'slug already exists' })
    }
    console.error(e)
    res.status(500).json({ error: '创建项目失败' })
  }
})

admin.put('/projects/:id', async (req, res) => {
  const normalized = normalizeProjectInput(req.body)
  if (!normalized.ok) return res.status(400).json({ error: normalized.error })
  const p = normalized.value
  try {
    const [existing] = await pool.query(
      'SELECT id FROM projects WHERE id = ? LIMIT 1',
      [req.params.id]
    )
    if (!existing[0]) return res.status(404).json({ error: 'Not found' })

    const [result] = await pool.query(
      `UPDATE projects SET
        name=?, slug=?, description=?, role=?, status=?, href=?, demo_url=?,
        cover_url=?, tags=?, featured=?, published=?, sort_order=?
       WHERE id=?`,
      [
        p.name,
        p.slug,
        p.description,
        p.role || null,
        p.status || null,
        p.href || null,
        p.demo_url || null,
        p.cover_url || null,
        p.tags,
        p.featured ? 1 : 0,
        p.published ? 1 : 0,
        p.sort_order,
        req.params.id,
      ]
    )
    if (result.affectedRows === 0 && result.changedRows === 0) {
      return res.json({ ok: true })
    }
    res.json({ ok: true })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'slug already exists' })
    }
    console.error(e)
    res.status(500).json({ error: '更新项目失败' })
  }
})

admin.delete('/projects/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [
      req.params.id,
    ])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '删除项目失败' })
  }
})

router.use('/admin', admin)

export default router
