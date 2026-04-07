import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'personal_blog',
  })

  const alters = [
    `ALTER TABLE guestbook_messages ADD COLUMN parent_id INT UNSIGNED NULL DEFAULT NULL`,
    `ALTER TABLE guestbook_messages ADD COLUMN pinned TINYINT(1) NOT NULL DEFAULT 0`,
  ]
  for (const sql of alters) {
    try {
      await conn.query(sql)
      console.log('OK:', sql.slice(0, 60) + '…')
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e
      console.log('Skip (exists):', sql.slice(30, 70))
    }
  }

  try {
    await conn.query(
      `CREATE INDEX idx_guestbook_parent ON guestbook_messages (parent_id)`
    )
    console.log('OK: index idx_guestbook_parent')
  } catch (e) {
    if (e.code !== 'ER_DUP_KEYNAME') throw e
  }

  await conn.end()
  console.log('OK: guestbook v2 migration done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
