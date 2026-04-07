<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { SITE_HEADER_LOGO } from '../config/blogTheme.js'
import {
  tagsFromRouteQuery,
  isEssayQuery,
  listTagsFromRoute,
} from '../utils/listQueryTags.js'

const route = useRoute()
const dark = ref(false)

function applyDark(v) {
  document.documentElement.classList.toggle('dark', v)
  try {
    localStorage.setItem('blog_dark', v ? '1' : '0')
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  try {
    dark.value = localStorage.getItem('blog_dark') === '1'
  } catch {
    dark.value = false
  }
  applyDark(dark.value)
})

watch(dark, (v) => applyDark(v))

function toggleDark() {
  dark.value = !dark.value
}

function homeClean() {
  return (
    route.path === '/' &&
    !isEssayQuery(route.query) &&
    listTagsFromRoute(route.query.tag).length === 0 &&
    !route.query.q &&
    (!route.query.page || route.query.page === '1')
  )
}

function navHome() {
  return (
    homeClean() &&
    route.hash !== '#blog-main' &&
    route.hash !== '#blog-posts'
      ? 'active'
      : ''
  )
}

/** 文章：列表区；选中「随笔」时交给随笔导航高亮，不与文章并列亮 */
function navArticles() {
  if (route.path !== '/') return ''
  if (isEssayQuery(route.query) || tagsFromRouteQuery(route.query.tag).includes('随笔')) {
    return ''
  }
  if (route.hash === '#blog-posts' || route.hash === '#blog-main') return 'active'
  if (!homeClean()) return 'active'
  return ''
}

function navEssay() {
  if (route.path !== '/') return ''
  return isEssayQuery(route.query) || tagsFromRouteQuery(route.query.tag).includes('随笔')
    ? 'active'
    : ''
}

/** 已在随笔首页（无附加标签、无搜索、第 1 页）：顶栏「随笔」不再作为链接，避免误触跳到文章 */
function essayNavAtRoot() {
  if (route.path !== '/') return false
  if (route.query.q) return false
  if (route.query.page && route.query.page !== '1') return false
  if (listTagsFromRoute(route.query.tag).length > 0) return false
  return (
    isEssayQuery(route.query) ||
    (tagsFromRouteQuery(route.query.tag).length === 1 &&
      tagsFromRouteQuery(route.query.tag)[0] === '随笔')
  )
}

function navGuestbook() {
  return route.name === 'guestbook' ? 'active' : ''
}
</script>

<template>
  <header class="global-header">
    <div class="main-header">
      <RouterLink to="/" class="logo">
        <span class="logo-text">{{ SITE_HEADER_LOGO }}</span>
      </RouterLink>
      <nav class="nav" aria-label="主导航">
        <RouterLink to="/" class="nav-item" :class="navHome()">主页</RouterLink>
        <RouterLink
          :to="{ path: '/', hash: '#blog-posts', query: {} }"
          class="nav-item"
          :class="navArticles()"
        >
          文章
        </RouterLink>
        <span
          v-if="essayNavAtRoot()"
          class="nav-item active"
          aria-current="page"
        >
          随笔
        </span>
        <RouterLink
          v-else
          :to="{ path: '/', query: { essay: '1' }, hash: '#blog-posts' }"
          class="nav-item"
          :class="navEssay()"
        >
          随笔
        </RouterLink>
        <RouterLink
          :to="{ name: 'guestbook' }"
          class="nav-item"
          :class="navGuestbook()"
        >
          留言
        </RouterLink>
      </nav>
      <div class="right">
        <button type="button" class="eye" title="切换暗色背景" @click="toggleDark">
          {{ dark ? '☀️' : '🌙' }} 护眼
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.global-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--blog-header-bg, rgba(2, 20, 45, 0.58));
  backdrop-filter: blur(var(--blog-header-blur, 20px)) saturate(160%);
  -webkit-backdrop-filter: blur(var(--blog-header-blur, 20px)) saturate(160%);
  border-bottom: 1px solid var(--blog-accent-border, rgba(120, 200, 255, 0.35));
  box-shadow: 0 4px 28px rgba(0, 15, 40, 0.35);
}
.main-header {
  height: 55px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  flex: 1;
  min-width: 0;
}
.nav-item {
  color: var(--blog-nav-text, #e8fbff);
  text-shadow: var(
    --blog-nav-shadow,
    0 0 14px rgba(0, 15, 40, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.85)
  );
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}
.nav-item:hover {
  background: rgba(100, 200, 255, 0.18);
  color: var(--blog-link-pop, #b3ebff);
}
.nav-item.active {
  background: rgba(100, 200, 255, 0.26);
  color: var(--blog-text-bright, #c5f1ff);
}
.logo {
  text-decoration: none;
  color: var(--blog-logo-color, #fff4e8);
  text-shadow: var(
    --blog-logo-shadow,
    0 0 1px rgba(20, 35, 55, 0.98),
    0 0 12px rgba(0, 30, 55, 0.7),
    0 2px 4px rgba(0, 0, 0, 0.45)
  );
  font-weight: 800;
  font-size: 1.12rem;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  transition: color 0.2s ease, filter 0.2s ease;
}

.logo:hover {
  color: var(--blog-logo-hover, #fffaf4);
  filter: brightness(1.06);
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.eye {
  border: 1px solid var(--blog-accent-border, rgba(100, 200, 255, 0.35));
  background: rgba(0, 40, 70, 0.35);
  color: var(--blog-nav-text, #e8fbff);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  text-shadow: var(--blog-nav-shadow);
}
.eye:hover {
  background: rgba(100, 200, 255, 0.22);
  border-color: rgba(140, 220, 255, 0.5);
}
:global(html.dark) .global-header {
  border-bottom-color: var(--blog-accent-border, rgba(79, 195, 247, 0.35));
}
</style>
