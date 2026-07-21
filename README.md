# MyBlog

Next.js 15 + MDX + Tailwind CSS 个人博客。

## 功能

- MDX 文章（支持 React 组件嵌入）
- 文章/随笔标签筛选
- 全文搜索
- 分页
- Giscus 留言板（基于 GitHub Discussions）
- RSS / Sitemap
- 玻璃拟态主题
- 响应式设计

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填写你的站点 URL 和 Giscus 配置。

### 3. 写文章

在 `content/posts/` 目录下新建 `.mdx` 文件：

```mdx
---
title: 文章标题
slug: 文章-slug
tags: [标签1, 标签2]
published: true
created_at: 2024-01-01
---

# 正文

这里是 Markdown 内容。
```

打上「随笔」标签的文章会出现在随笔列表，而不是默认文章列表。

### 4. 本地开发

```bash
npm run dev
```

打开 <http://localhost:3000>

### 5. 构建

```bash
npm run build
```

## 部署到 Vercel

1. 把代码推送到 GitHub
2. 在 <https://vercel.com> 导入仓库
3. 配置环境变量（`NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_GISCUS_*`）
4. 部署

Vercel 会自动检测 Next.js 项目并配置构建。

## 迁移旧文章

如果你之前用的是 Vue + Express + MySQL 版本，可以用以下 SQL 导出文章：

```sql
SELECT title, slug, content, tags, published, created_at, updated_at
FROM posts
ORDER BY created_at DESC;
```

然后把每篇文章保存为 `content/posts/{slug}.mdx`，格式如下：

```mdx
---
title: {title}
slug: {slug}
tags: [{tags}]
published: {published}
created_at: {created_at}
updated_at: {updated_at}
---

{content}
```

## 技术栈

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- MDX (`next-mdx-remote`)
- Giscus (`@giscus/react`)
- gray-matter + reading-time

## 目录结构

```
.
├── content/posts/          # MDX 文章
├── public/                 # 静态资源
├── src/
│   ├── app/               # Next.js App Router 页面
│   │   ├── api/posts/     # 文章 API
│   │   ├── guestbook/     # 留言板
│   │   ├── post/[slug]/   # 文章详情
│   │   ├── rss.xml/       # RSS
│   │   ├── sitemap.xml/   # Sitemap
│   │   ├── globals.css    # 全局样式
│   │   ├── layout.tsx     # 根布局
│   │   └── page.tsx       # 首页
│   ├── components/        # React 组件
│   ├── config/            # 站点配置
│   └── lib/               # 工具函数
├── .env.example           # 环境变量模板
├── next.config.ts         # Next.js 配置
├── package.json
├── tsconfig.json
└── vercel.json            # Vercel 配置
```

## 许可

按你的需要自行补充 LICENSE。
