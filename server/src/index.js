import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import guestbookRoutes, { guestbookAdminRouter } from './routes/guestbook.js'

const app = express()
const port = Number(process.env.PORT || 3001)

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1)
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json({ limit: '2mb' }))

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
app.get('/', (_req, res) => {
  res.redirect(302, clientOrigin)
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api', postRoutes)
app.use('/api', guestbookRoutes)
app.use('/api/admin', guestbookAdminRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

app.listen(port, () => {
  console.log(`API http://localhost:${port}`)
  console.log(`Open the site in browser: ${clientOrigin} (not port ${port})`)
})