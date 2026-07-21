import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'

/**
 * 仅写入演示数据：管理员账号 + 一篇 Hello World（无个人文章）。
 * 你自己的正文、随笔、留言只存在于数据库，不会进 Git。
 */
async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'personal_blog',
  })

  const username = process.env.SEED_ADMIN_USER || 'admin'
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(password, 10)

  await conn.query(
    `INSERT INTO users (username, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [username, hash]
  )

  const [rows] = await conn.query(
    'SELECT COUNT(*) AS c FROM posts WHERE slug = ?',
    ['hello-world']
  )
  if (rows[0].c === 0) {
    await conn.query(
      `INSERT INTO posts (title, slug, content, published, tags) VALUES (?, ?, ?, 1, ?)`,
      [
        'Hello World',
        'hello-world',
        '# Hello\n\nThis is **Markdown**. Edit or delete me in admin.',
        'Demo',
      ]
    )
  }

  await conn.end()
  console.log(
    `Seed OK: user "${username}" / "${password}" (set SEED_ADMIN_* in .env to override), demo post hello-world`
  )
  console.warn('⚠️  上线前请修改管理员密码，勿使用默认 admin123。')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
