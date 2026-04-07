<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'
import SakuraLayer from '../components/SakuraLayer.vue'

const route = useRoute()
const post = ref(null)
usePageTitle(() => post.value?.title)
const err = ref('')
const html = computed(() => {
  if (!post.value) return ''
  const raw = marked.parse(post.value.content, { async: false })
  return DOMPurify.sanitize(raw)
})

async function load() {
  post.value = null
  err.value = ''
  try {
    const { data } = await http.get(`/api/posts/slug/${route.params.slug}`)
    post.value = data
  } catch (e) {
    err.value = e.response?.status === 404 ? '文章不存在' : '加载失败'
  }
}

watch(() => route.params.slug, load, { immediate: true })
</script>

<template>
  <div class="post-page">
    <SakuraLayer />
    <div class="inner">
      <p class="back-wrap">
        <RouterLink class="back" to="/">← 返回文章列表</RouterLink>
      </p>
      <p v-if="err" class="err">{{ err }}</p>
      <article v-else-if="post" class="article card">
        <h1>{{ post.title }}</h1>
        <p class="meta">
          📅 {{ post.created_at?.slice(0, 10) }}
          <span v-if="post.reading_minutes"> · 约 {{ post.reading_minutes }} 分钟阅读</span>
        </p>
        <p v-if="post.tags?.length" class="tags">
          <RouterLink
            v-for="tg in post.tags"
            :key="tg"
            class="tag"
            :to="
              tg === '随笔'
                ? { path: '/', query: { essay: '1' }, hash: '#blog-posts' }
                : { path: '/', query: { tag: tg }, hash: '#blog-posts' }
            "
          >
            {{ tg }}
          </RouterLink>
        </p>
        <div class="md" v-html="html" />
      </article>
    </div>
  </div>
</template>

<style scoped>
.post-page {
  position: relative;
  min-height: calc(100vh - 55px);
  padding: 28px 16px 48px;
  background: transparent;
  overflow: hidden;
  color: var(--blog-text, #8fd8f0);
}

.inner {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
}

.back-wrap {
  margin: 0 0 16px;
}

.back {
  color: var(--blog-link-pop, #b3ebff);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  text-shadow: var(--blog-nav-shadow);
}

.back:hover {
  text-decoration: underline;
}

.article.card {
  background: var(--blog-glass-card-bg, rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(var(--blog-glass-card-blur, 12px)) saturate(150%);
  -webkit-backdrop-filter: blur(var(--blog-glass-card-blur, 12px)) saturate(150%);
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.26));
  border-radius: 18px;
  padding: 28px 28px 36px;
  box-shadow: 0 8px 32px rgba(0, 25, 50, 0.15);
}

.article h1 {
  margin: 0 0 10px;
  font-size: 1.85rem;
  color: var(--blog-text-bright, #c5f1ff);
  text-shadow: var(--blog-title-shadow);
}

.meta {
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.7));
  font-size: 0.9rem;
  margin: 0 0 12px;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.9),
    0 1px 2px rgba(0, 0, 0, 0.3)
  );
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 20px;
}

.tags .tag {
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #a18cd1, #fbc2eb);
  color: #fff;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.tags .tag:hover {
  opacity: 0.92;
}

.err {
  color: #c62828;
  font-weight: 600;
}

/* 正文统一用与 Logo 同系的奶色；仅标题用亮青 */
.md :deep(h1),
.md :deep(h2),
.md :deep(h3),
.md :deep(h4) {
  margin-top: 1.4rem;
  color: var(--blog-text-bright, #c5f1ff);
  text-shadow: var(--blog-title-shadow);
}

.md :deep(p),
.md :deep(li) {
  line-height: 1.75;
  color: var(--blog-body-on-glass, #fff4e8);
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.35)
  );
}

.md :deep(li) {
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.9),
    0 1px 2px rgba(0, 0, 0, 0.3)
  );
}

/* 加粗：同色略提亮，不再跳成青色 */
.md :deep(strong) {
  color: var(--blog-logo-hover, #fffaf4);
  font-weight: 700;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.85),
    0 1px 2px rgba(0, 0, 0, 0.3)
  );
}

/* 引用块与正文同色，只靠左边线区分，避免一块发灰 */
.md :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.5rem 0 0.5rem 1rem;
  border-left: 3px solid var(--blog-accent-border, rgba(100, 200, 255, 0.45));
  color: var(--blog-body-on-glass, #fff4e8);
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.85),
    0 1px 2px rgba(0, 0, 0, 0.28)
  );
}

.md :deep(blockquote p),
.md :deep(blockquote li) {
  color: inherit;
}

/* 覆盖浏览器默认蓝/紫链接，全文统一一种链接色 */
.md :deep(a) {
  color: var(--blog-link-pop, #b3ebff);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.75),
    0 1px 2px rgba(0, 0, 0, 0.3)
  );
}

.md :deep(a:hover) {
  color: var(--blog-text-bright, #a8e8fc);
}

.md :deep(code) {
  background: rgba(0, 30, 55, 0.45);
  color: var(--blog-text-bright, #c5f1ff);
  padding: 0.12em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  border: 1px solid var(--blog-accent-border, rgba(100, 200, 255, 0.25));
}

.md :deep(pre) {
  background: rgba(0, 20, 40, 0.55);
  border: 1px solid var(--blog-accent-border, rgba(100, 200, 255, 0.22));
  border-radius: 10px;
}

.md :deep(pre code) {
  display: block;
  padding: 1rem;
  overflow: auto;
  background: transparent;
  border: none;
}

:global(html.dark) .article.card {
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.4);
}
</style>
