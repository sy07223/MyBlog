# Blog agent

编辑 `sources.json`，把要关注的 RSS 或文章 URL 放进去。示例：

```json
{
  "feeds": [
    {
      "name": "Hacker News",
      "url": "https://hnrss.org/frontpage",
      "tags": ["技术", "资讯"]
    }
  ],
  "articles": [
    {
      "name": "指定文章",
      "url": "https://example.com/article",
      "tags": ["待读"]
    }
  ]
}
```

`inbox.json` 是自动生成的采集状态文件，不要手动编辑。草稿会写入 `content/drafts/`，确认后再发布到 `content/posts/`。
