import 'dotenv/config'
import mysql from 'mysql2/promise'

const projects = [
  {
    name: 'MyBlog',
    slug: 'myblog',
    description: '一个用 Next.js、MDX 和 Tailwind CSS 搭建的个人博客。',
    role: '设计与开发',
    status: '持续迭代',
    href: 'https://github.com/sy07223/MyBlog',
    tags: 'Next.js,MDX,TypeScript',
    featured: 1,
    sort_order: 10,
  },
  {
    name: '跃动视界 Flow',
    slug: 'yuedong-flow',
    description: '面向工作流定义与执行的独立服务，支持工作流编排、运行监控与节点执行。',
    role: '产品与全栈开发',
    status: '本地开发',
    href: null,
    tags: 'React,React Flow,FastAPI,PostgreSQL',
    featured: 1,
    sort_order: 20,
  },
  {
    name: 'LoveSync',
    slug: 'lovesync',
    description: '基于微信原生小程序与云开发的情侣空间，包含任务、礼物、心情、回忆相册和厨房点餐等功能。',
    role: '产品与开发',
    status: '开源示例',
    href: 'https://github.com/sy07223/MyLoveNative',
    tags: '微信小程序,云开发,Cloud Functions',
    featured: 0,
    sort_order: 30,
  },
  {
    name: 'Language Learning',
    slug: 'language-learning',
    description: '围绕语言学习体验打造的个人项目。',
    role: '产品与开发',
    status: '持续探索',
    href: 'https://github.com/sy07223/lang-learning',
    tags: 'Language Learning,Product',
    featured: 0,
    sort_order: 40,
  },
]

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE || 'personal_blog',
  })

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        slug VARCHAR(160) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        role VARCHAR(120) NULL DEFAULT NULL,
        status VARCHAR(64) NULL DEFAULT NULL,
        href VARCHAR(1024) NULL DEFAULT NULL,
        demo_url VARCHAR(1024) NULL DEFAULT NULL,
        cover_url VARCHAR(1024) NULL DEFAULT NULL,
        tags VARCHAR(512) NULL DEFAULT NULL,
        featured TINYINT(1) NOT NULL DEFAULT 0,
        published TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    for (const project of projects) {
      await conn.query(
        `INSERT IGNORE INTO projects
          (name, slug, description, role, status, href, tags, featured, published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          project.name,
          project.slug,
          project.description,
          project.role,
          project.status,
          project.href,
          project.tags,
          project.featured,
          project.sort_order,
        ]
      )
    }
    console.log(`Projects ready: ${projects.length}`)
  } finally {
    await conn.end()
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
