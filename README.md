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

打开 <http://localhost:3100>

如果要让公开端读取后台管理的项目，请在 Next.js 项目的环境变量中设置：

```env
BLOG_API_URL=http://localhost:3001/api
```

首次启用项目管理时，在 `server` 目录执行：

```bash
npm install
# 复制 env.example 为 .env，并填写 MySQL 配置
npm run db:migrate-projects
npm run dev
```

再在另一个终端启动管理端：

```bash
cd client
npm install
npm run dev
```

然后打开 `http://localhost:5173/admin/projects`，即可新增、编辑、排序、发布或隐藏项目。没有配置 `BLOG_API_URL` 时，公开端会使用 `src/config/site.ts` 中的静态项目作为兜底。

### 5. 构建

```bash
npm run build
```

## AI 编辑代理（第一版）

项目现在带有一个本地编辑代理：它可以读取 RSS/文章链接、调用 GPT 生成未发布草稿，并在你确认后把草稿发布到 `content/posts/`。默认不会自动发布，也不会自动推送 Git。

先编辑 `content/agent/sources.json`，再配置 DeepSeek API Key。你刚才发出的旧 Key 已暴露，请先撤销并重新生成；不要把 Key 写进项目文件：

```powershell
# 在项目根目录创建 .env.local，内容如下；不要提交这个文件
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=新的_DEEPSEEK_API_KEY
DEEPSEEK_MODEL=deepseek-v4-flash
```

也可以把 `AI_PROVIDER` 改成 `openai`，使用 `OPENAI_API_KEY` 和 `OPENAI_MODEL`。

如果希望代理自动发布，可在 `.env.local` 增加：

```env
OBSIDIAN_VAULT_PATH=C:/Users/30848/Documents/Obsidian Vault
AUTO_PUBLISH=1
AUTO_COMMIT=1
AUTO_PUSH=1
```

自动发布仍会先经过来源、隐私、危险操作和高风险建议检查；被拦截的文章会留在 `content/drafts/`。通过检查的文章会同步到 Obsidian 的 `AI Agent/Published/`。

然后执行：

```bash
npm run agent -- collect
npm run agent -- draft --all
npm run agent -- preview
npm run agent -- preview your-slug
```

确认草稿后发布：

```bash
npm run agent -- publish your-slug
# 需要同时创建 Git commit 时：
npm run agent -- publish your-slug --commit
```

`npm run agent -- run` 会采集并生成草稿，但永远不会发布。`OPENCLAW.md` 里有一份可以直接交给 OpenClaw 的操作规则。

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
