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

  await conn.query(`
    CREATE TABLE IF NOT EXISTS guestbook_messages (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      parent_id INT UNSIGNED NULL DEFAULT NULL,
      nickname VARCHAR(64) NOT NULL,
      content VARCHAR(2000) NOT NULL,
      approved TINYINT(1) NOT NULL DEFAULT 1,
      pinned TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_guestbook_parent (parent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  for (const sql of [
    `ALTER TABLE guestbook_messages ADD COLUMN approved TINYINT(1) NOT NULL DEFAULT 1`,
    `ALTER TABLE guestbook_messages ADD COLUMN parent_id INT UNSIGNED NULL DEFAULT NULL`,
    `ALTER TABLE guestbook_messages ADD COLUMN pinned TINYINT(1) NOT NULL DEFAULT 0`,
  ]) {
    try {
      await conn.query(sql)
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e
    }
  }

  try {
    await conn.query(
      `CREATE INDEX idx_guestbook_parent ON guestbook_messages (parent_id)`
    )
  } catch (e) {
    if (e.code !== 'ER_DUP_KEYNAME') throw e
  }

  console.log('OK: guestbook_messages ready.')
  await conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
