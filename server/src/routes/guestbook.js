import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../requireAuth.js'
import { autoModerateGuestbook } from '../guestbookModeration.js'

const router = Router()

/** 公开列表：置顶主楼 + 审核通过的回复 */
router.get('/guestbook', async (_req, res) => {
  try {
    const [roots] = await pool.query(
      `SELECT id, nickname, content, pinned, created_at
       FROM guestbook_messages
       WHERE approved = 1 AND parent_id IS NULL
       ORDER BY pinned DESC, created_at DESC
       LIMIT 80`
    )
    const [replies] = await pool.query(
      `SELECT id, parent_id, nickname, content, created_at
       FROM guestbook_messages
       WHERE approved = 1 AND parent_id IS NOT NULL
       ORDER BY created_at ASC`
    )
    const byParent = new Map()
    for (const r of replies) {
      const k = r.parent_id
      if (!byParent.has(k)) byParent.set(k, [])
      byParent.get(k).push({
        id: r.id,
        nickname: r.nickname,
        content: r.content,
        created_at: r.created_at,
      })
    }
    const items = roots.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      content: row.content,
      pinned: !!row.pinned,
      created_at: row.created_at,
      replies: byParent.get(row.id) || [],
    }))
    res.json({ items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '加载留言失败' })
  }
})

router.post('/guestbook', async (req, res) => {
  const nickname = String(req.body?.nickname ?? '').trim()
  const content = String(req.body?.content ?? '').trim()
  const parentIdRaw = req.body?.parent_id
  let parentId = null
  if (parentIdRaw != null && parentIdRaw !== '') {
    const n = parseInt(String(parentIdRaw), 10)
    if (!Number.isFinite(n) || n < 1) {
      return res.status(400).json({ error: '无效的 parent_id' })
    }
    parentId = n
  }

  if (!nickname || nickname.length > 32) {
    return res.status(400).json({ error: '昵称为 1～32 字' })
  }
  if (!content || content.length > 2000) {
    return res.status(400).json({ error: '内容为 1～2000 字' })
  }

  const mod = autoModerateGuestbook(nickname, content)
  if (!mod.ok) {
    return res.status(400).json({ error: mod.message })
  }

  try {
    if (parentId != null) {
      const [parents] = await pool.query(
        'SELECT id, parent_id FROM guestbook_messages WHERE id = ? LIMIT 1',
        [parentId]
      )
      const p = parents[0]
      if (!p) return res.status(400).json({ error: '回复对象不存在' })
      if (p.parent_id != null) {
        return res.status(400).json({ error: '仅支持回复主留言' })
      }
    }

    const [r] = await pool.query(
      `INSERT INTO guestbook_messages (parent_id, nickname, content, approved)
       VALUES (?, ?, ?, 1)`,
      [parentId, nickname, content]
    )
    res.status(201).json({ id: r.insertId, ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '发表失败' })
  }
})

/** ——— 后台 ——— */
const admin = Router()
admin.use(requireAuth)

admin.get('/guestbook', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, parent_id, nickname, content, approved, pinned, created_at
       FROM guestbook_messages
       ORDER BY created_at DESC`
    )
    res.json({ items: rows })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '加载失败' })
  }
})

admin.patch('/guestbook/:id', async (req, res) => {
  const id = req.params.id
  const { pinned, approved } = req.body || {}
  try {
    const [rows] = await pool.query(
      'SELECT id, parent_id FROM guestbook_messages WHERE id = ? LIMIT 1',
      [id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    const updates = []
    const params = []
    if (typeof pinned === 'boolean') {
      if (pinned && rows[0].parent_id != null) {
        return res.status(400).json({ error: '仅主留言可置顶' })
      }
      updates.push('pinned = ?')
      params.push(pinned ? 1 : 0)
    }
    if (typeof approved === 'boolean') {
      updates.push('approved = ?')
      params.push(approved ? 1 : 0)
    }
    if (!updates.length) {
      return res.status(400).json({ error: '无有效字段' })
    }
    params.push(id)
    await pool.query(
      `UPDATE guestbook_messages SET ${updates.join(', ')} WHERE id = ?`,
      params
    )
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '更新失败' })
  }
})

admin.delete('/guestbook/:id', async (req, res) => {
  try {
    const id = req.params.id
    const [rows] = await pool.query(
      'SELECT id FROM guestbook_messages WHERE id = ? LIMIT 1',
      [id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    await pool.query('DELETE FROM guestbook_messages WHERE parent_id = ?', [id])
    await pool.query('DELETE FROM guestbook_messages WHERE id = ?', [id])
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '删除失败' })
  }
})

export { admin as guestbookAdminRouter }
export default router
