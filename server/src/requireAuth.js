import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const h = req.headers.authorization
  let token = null
  if (h && h.startsWith('Bearer ')) token = h.slice(7)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}