# OpenClaw blog workflow

推荐使用项目根目录的 `.env.local` 配置 DeepSeek，避免把 Key 写入 Git：

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=新的_DEEPSEEK_API_KEY
DEEPSEEK_MODEL=deepseek-v4-flash
OBSIDIAN_VAULT_PATH=C:/Users/30848/Documents/Obsidian Vault
AUTO_PUBLISH=1
AUTO_COMMIT=1
AUTO_PUSH=1
```

把本目录作为 OpenClaw 的工作区时，只允许代理使用下面的博客命令：

```bash
npm run agent -- collect
npm run agent -- draft --all
npm run agent -- preview
npm run agent -- publish <slug>
```

安全规则：

1. 采集和生成草稿可以自动执行。
2. `run` 可以自动发布低风险草稿；高风险内容必须被安全闸门拦截并留在草稿目录。
3. 不得绕过安全闸门，不得使用 `--force` 类绕过参数。
4. 不得读取、打印或修改 `.env`、密钥、数据库和部署配置。
5. 不得删除文章；代码修改应先展示 diff。
6. 发布后先运行 `npm run lint` 和 `npm run build`；检查通过后，只有我明确要求时才执行 `git push`。

建议定时任务只执行：

```bash
npm run agent -- run
```

它会采集并生成未发布草稿，不会发布文章。
