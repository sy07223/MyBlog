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

  try {
    await conn.query(
      `ALTER TABLE posts ADD COLUMN tags VARCHAR(512) NULL DEFAULT NULL`
    )
    console.log('Added column posts.tags')
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column posts.tags already exists, skip')
    } else {
      throw e
    }
  }

  await conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
