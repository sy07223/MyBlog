# personal-blog

Vue 3 + Vite 前端，Express + MySQL 后端的个人博客：文章 / 随笔标签、留言板（含回复与后台管理）、Markdown 后台等。

**仓库里只有代码与演示配置，不包含你的真实文章、随笔正文或留言数据**（这些内容在本地 MySQL 里，不会进 Git）。

## 快速开始

1. 安装依赖（根目录、client、server 各自）  
   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

2. 配置环境变量  
   - 复制 `server/env.example` 为 `server/.env`，**务必修改 `JWT_SECRET`**，填写 MySQL 账号。  
   - 可选：复制 `client/.env.example` 为 `client/.env.local`（生产构建时再配 `VITE_API_BASE`）。

3. 初始化数据库  
   ```bash
   cd server
   npm run db:init
   npm run db:migrate-guestbook
   npm run db:seed
   ```  
   默认管理员：`admin` / `admin123`（可用环境变量 `SEED_ADMIN_USER`、`SEED_ADMIN_PASSWORD` 覆盖），**部署前请改掉密码**。

4. 开发运行  
   ```bash
   cd ..
   npm run dev
   ```  
   前端 <http://localhost:5173>，API 通过 Vite 代理到 `http://127.0.0.1:3001`。

## 上传到 GitHub

1. 确认未提交密钥：根目录 `.gitignore` 已排除 `.env`、`node_modules`、`client/dist` 等。  
2. 若曾误提交本地大图/视频，从索引移除（文件可保留在本地）：  
   ```bash
   git rm -r --cached client/public/你的私密文件.jpg 2>nul
   ```  
3. 初始化并推送：  
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

站点名称、头像、背景、社交链接等请改 `client/src/config/blogTheme.js`，并在 `client/public/` 放置自己的静态资源（大图/视频建议本地使用 + `.gitignore` 已忽略常见扩展名，避免误传）。

## Docker MySQL（可选）

见根目录 `docker-compose.yml`。使用容器时把 `server/.env` 里 `MYSQL_PORT`、`MYSQL_PASSWORD` 与 compose 中配置对齐。

## 许可

按你的需要自行补充 LICENSE。
