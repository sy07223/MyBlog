import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const host = process.env.MYSQL_HOST || '127.0.0.1'
  const port = Number(process.env.MYSQL_PORT || 3306)
  const user = process.env.MYSQL_USER || 'root'
  const password = process.env.MYSQL_PASSWORD ?? ''
  const database = process.env.MYSQL_DATABASE || 'personal_blog'
  if (!/^[a-zA-Z0-9_]+$/.test(database)) {
    throw new Error('Invalid MYSQL_DATABASE (use letters, digits, underscore only)')
  }

  if (password === '' && !process.argv.includes('--allow-empty-password')) {
    console.error(
      'Set MYSQL_PASSWORD in server/.env to your MySQL root password, then run: npm run db:init'
    )
    console.error(
      'If root has no password: npm run db:init -- --allow-empty-password'
    )
    process.exit(1)
  }

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  })

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )

  const schemaPath = path.join(__dirname, 'schema.sql')
  const sql = await fs.readFile(schemaPath, 'utf8')
  await conn.query(sql)

  await conn.end()
  console.log(`OK: database "${database}" is ready (schema applied).`)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
