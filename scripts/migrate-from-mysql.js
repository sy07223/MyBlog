#!/usr/bin/env node

/**
 * 从旧版 MySQL 博客导出文章为 MDX 文件
 * 使用方法：
 *   1. 确保旧项目 MySQL 还在运行
 *   2. 修改下面的数据库配置
 *   3. node scripts/migrate-from-mysql.js
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const config = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "personal_blog",
};

const OUTPUT_DIR = path.join(__dirname, "..", "content", "posts");

function escapeYaml(str) {
  if (!str) return '""';
  const s = String(str);
  if (/[:#\[\]{}&*!|>'"%@`]/.test(s) || s.includes("\n")) {
    return `"${s.replace(/"/g, '\\"')}"`;
  }
  return s;
}

function formatDate(date) {
  if (!date) return new Date().toISOString().slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
}

async function migrate() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const pool = mysql.createPool(config);

  try {
    const [rows] = await pool.query(
      `SELECT title, slug, content, tags, published, created_at, updated_at
       FROM posts
       ORDER BY created_at DESC`
    );

    console.log(`找到 ${rows.length} 篇文章`);

    for (const row of rows) {
      const slug = row.slug || `post-${row.id}`;
      const filename = `${slug}.mdx`;
      const filepath = path.join(OUTPUT_DIR, filename);

      const tags = row.tags
        ? row.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const frontmatter = [
        "---",
        `title: ${escapeYaml(row.title)}`,
        `slug: ${escapeYaml(slug)}`,
        `tags: [${tags.map(escapeYaml).join(", ")}]`,
        `published: ${row.published ? "true" : "false"}`,
        `created_at: ${formatDate(row.created_at)}`,
      ];

      if (row.updated_at) {
        frontmatter.push(`updated_at: ${formatDate(row.updated_at)}`);
      }

      frontmatter.push("---", "", row.content || "");

      fs.writeFileSync(filepath, frontmatter.join("\n"), "utf8");
      console.log(`已导出: ${filename}`);
    }

    console.log("迁移完成！");
  } catch (e) {
    console.error("迁移失败:", e.message);
    console.error(
      "\n提示：如果 MySQL 已停止，你可以手动复制文章内容到 content/posts/ 目录。"
    );
  } finally {
    await pool.end();
  }
}

migrate();
