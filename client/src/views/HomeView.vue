<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'
import SakuraLayer from '../components/SakuraLayer.vue'
import {
  SITE_DISPLAY_NAME,
  SITE_WELCOME_NICK,
  SITE_TAGLINE,
  SITE_BIO_PARAGRAPHS,
  SITE_AVATAR_URL,
  SITE_CONTACT_QR,
  SITE_SOCIAL_LINKS,
} from '../config/blogTheme.js'
import {
  tagsFromRouteQuery,
  isEssayQuery,
  listTagsFromRoute,
  buildListQuery,
} from '../utils/listQueryTags.js'

usePageTitle(() => SITE_DISPLAY_NAME || '首页')

const route = useRoute()
const router = useRouter()
const posts = ref([])
const listReady = ref(false)
const err = ref('')
const total = ref(0)
const pages = ref(1)
const limit = 8
const searchDraft = ref('')
const allTags = ref([])
/** 仅出现在「带随笔标签」的帖子上的标签，与文章列表的全局标签区分 */
const essayTags = ref([])

const tagGradients = [
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
]

function tagBg(i) {
  return tagGradients[i % tagGradients.length]
}

function essayFlagFromRoute() {
  return (
    isEssayQuery(route.query) ||
    tagsFromRouteQuery(route.query.tag).includes('随笔')
  )
}

const page = computed({
  get: () => Math.max(1, parseInt(String(route.query.page), 10) || 1),
  set: (p) => {
    router.push({
      path: '/',
      hash: route.hash || '#blog-posts',
      query: buildListQuery(
        p,
        route.query.q,
        listTagsFromRoute(route.query.tag),
        essayFlagFromRoute()
      ),
    })
  },
})

/** 当前选中的附加标签（不含「随笔」，随笔由 ?essay=1 表示） */
const activeTags = computed(() => listTagsFromRoute(route.query.tag))

const activeQ = computed(() =>
  typeof route.query.q === 'string' ? route.query.q.trim() : ''
)

const isEssayMode = computed(
  () =>
    isEssayQuery(route.query) ||
    tagsFromRouteQuery(route.query.tag).includes('随笔')
)

watch(
  () => route.query.q,
  (q) => {
    searchDraft.value = typeof q === 'string' ? q : ''
  },
  { immediate: true }
)

async function load() {
  err.value = ''
  listReady.value = false
  try {
    const essay = isEssayMode.value
    const params = {
      page: page.value,
      limit,
      q: activeQ.value || undefined,
    }
    if (essay) params.essay = '1'
    if (activeTags.value.length) {
      params.tag =
        activeTags.value.length === 1 ? activeTags.value[0] : activeTags.value
    }
    const { data } = await http.get('/api/posts', { params })
    posts.value = data.items
    total.value = data.total
    pages.value = data.pages
    if (page.value > data.pages && data.pages > 0) {
      page.value = data.pages
    }
  } catch (e) {
    err.value = e.response?.data?.error || '加载失败'
  } finally {
    listReady.value = true
  }
}

watch(
  () => {
    const tagKey = [...activeTags.value].sort().join('\0')
    const essay = isEssayQuery(route.query) ? '1' : '0'
    const legacy = tagsFromRouteQuery(route.query.tag).includes('随笔') ? '1' : '0'
    return `${route.query.page}|${route.query.q ?? ''}|${tagKey}|${essay}|${legacy}`
  },
  () => load(),
  { immediate: true }
)

/** 将旧链接 ?tag=随笔 规范为 ?essay=1，避免顶栏「随笔」重复点击误导航 */
watch(
  () => route.query,
  (q) => {
    if (route.path !== '/') return
    if (isEssayQuery(q)) return
    const all = tagsFromRouteQuery(q.tag)
    if (all.length !== 1 || all[0] !== '随笔') return
    router.replace({
      path: '/',
      hash: route.hash || '#blog-posts',
      query: buildListQuery(
        Math.max(1, parseInt(String(q.page), 10) || 1),
        q.q,
        [],
        true
      ),
    })
  },
  { flush: 'post' }
)

onMounted(async () => {
  document.addEventListener('pointerdown', onDocPointerDown, true)
  document.addEventListener('keydown', onEscapeQr)
  try {
    const [allRes, essayRes] = await Promise.all([
      http.get('/api/tags'),
      http.get('/api/tags', { params: { scope: 'essay' } }),
    ])
    allTags.value = allRes.data.tags || []
    essayTags.value = (essayRes.data.tags || []).filter((t) => t !== '随笔')
  } catch {
    allTags.value = []
    essayTags.value = []
  }
})

function applySearch() {
  router.push({
    path: '/',
    hash: '#blog-posts',
    query: buildListQuery(1, searchDraft.value, activeTags.value, isEssayMode.value),
  })
}

/**
 * 清空搜索；文章列表去掉全部标签。
 * 随笔视图保留「随笔」标签，只去掉其它标签与搜索，避免误回到文章导航高亮。
 */
function clearFilters() {
  searchDraft.value = ''
  if (isEssayMode.value) {
    router.push({
      path: '/',
      hash: '#blog-posts',
      query: { essay: '1' },
    })
  } else {
    router.push({ path: '/', hash: '#blog-posts', query: {} })
  }
}

/** 仅有「随笔」且无搜索时，没有可清除的筛选，不显示按钮 */
const showClearFilters = computed(() => {
  if (activeQ.value) return true
  if (isEssayMode.value) return activeTags.value.length > 0
  return activeTags.value.length > 0
})

function toggleTag(t) {
  const next = new Set(activeTags.value)
  if (next.has(t)) next.delete(t)
  else next.add(t)
  router.push({
    path: '/',
    hash: '#blog-posts',
    query: buildListQuery(1, route.query.q, [...next], essayFlagFromRoute()),
  })
}

/** 仅首页首屏、无筛选时展示全屏欢迎（带 #blog-posts 时不展示，避免大首屏把锚点顶乱导致要点两次「文章」） */
const showHero = computed(
  () =>
    route.path === '/' &&
    !isEssayMode.value &&
    activeTags.value.length === 0 &&
    !activeQ.value &&
    page.value === 1 &&
    route.hash !== '#blog-posts'
)

const searchPlaceholder = computed(() =>
  isEssayMode.value ? '搜索随笔正文…' : '搜索标题或正文…'
)

/** 文章列表不展示「随笔」；随笔内也不展示（默认同属随笔，仅保留其它附加标签） */
const tagCloudTags = computed(() => {
  if (isEssayMode.value) return essayTags.value.filter((t) => t !== '随笔')
  return allTags.value.filter((t) => t !== '随笔')
})

const TAG_CLOUD_COLLAPSE_AT = 14
const tagsExpanded = ref(false)
watch(isEssayMode, () => {
  tagsExpanded.value = false
})

const tagCloudOverflow = computed(
  () => tagCloudTags.value.length > TAG_CLOUD_COLLAPSE_AT
)

const displayedTagCloudTags = computed(() => {
  if (!tagCloudOverflow.value || tagsExpanded.value) return tagCloudTags.value
  return tagCloudTags.value.slice(0, TAG_CLOUD_COLLAPSE_AT)
})

function scrollToMain() {
  document.getElementById('blog-main')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

/** 列表为空时的说明（避免随笔等筛选看起来像「坏了」） */
const emptyListHint = computed(() => {
  if (!listReady.value) return ''
  if (err.value) return ''
  if (posts.value.length > 0) return ''
  const tags = activeTags.value
  if (isEssayMode.value && tags.length === 0) {
    return '这里还没有随笔。在后台写文章时打上「随笔」标签，保存后就会出现在此。'
  }
  if (tags.length) {
    const label = tags.map((x) => `「${x}」`).join('')
    if (tags.length > 1) {
      return `暂无同时带有 ${label} 的文章，可少选一个标签试试。`
    }
    return `暂无带有「${tags[0]}」标签的文章。`
  }
  if (activeQ.value) {
    return `没有找到与「${activeQ.value}」匹配的文章，换个关键词试试。`
  }
  return '还没有文章。可在后台新建一篇。'
})

const hasContactLinks = computed(
  () => SITE_CONTACT_QR.length > 0 || SITE_SOCIAL_LINKS.length > 0
)

const qrHover = ref(null)
const qrPinned = ref(null)

function qrPopoverVisible(label) {
  if (qrPinned.value != null) return qrPinned.value === label
  return qrHover.value === label
}

function onQrEnter(label) {
  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
    qrHover.value = label
  }
}

function onQrLeave() {
  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
    qrHover.value = null
  }
}

function onQrToggle(label) {
  qrPinned.value = qrPinned.value === label ? null : label
}

function onDocPointerDown(e) {
  const el = e.target
  if (el instanceof Element && el.closest('.qr-chip-wrap')) return
  qrPinned.value = null
}

function onEscapeQr(e) {
  if (e.key === 'Escape') qrPinned.value = null
}

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  document.removeEventListener('keydown', onEscapeQr)
})
</script>

<template>
  <div
    class="blog-list-view"
    :class="{ 'blog-list-view--hero': showHero, 'blog-list-view--essay': isEssayMode }"
  >
    <SakuraLayer />

    <section
      v-if="showHero"
      class="hero-welcome"
      aria-label="欢迎"
    >
      <div class="hero-welcome-inner">
        <h1 class="hero-welcome-title">
          欢迎来到
          <span class="hero-welcome-nick">{{ SITE_WELCOME_NICK }}</span>
          的博客
        </h1>
      </div>
      <button
        type="button"
        class="hero-scroll-cue"
        aria-label="查看正文"
        @click="scrollToMain"
      >
        <span class="hero-scroll-arrow" aria-hidden="true">⌄</span>
      </button>
      <div class="hero-welcome-fade" aria-hidden="true" />
    </section>

    <div
      id="blog-main"
      class="inner"
      :class="{ 'inner-after-hero': showHero }"
    >
      <div class="intro glass-panel">
        <header class="blog-list-header profile-header">
          <img
            v-if="SITE_AVATAR_URL"
            class="profile-avatar"
            :src="SITE_AVATAR_URL"
            width="96"
            height="96"
            alt=""
          />
          <div class="profile-text">
            <component
              :is="showHero ? 'h2' : 'h1'"
              class="profile-site-heading"
            >
              {{ SITE_DISPLAY_NAME }}
            </component>
            <p v-if="SITE_TAGLINE" class="profile-tagline">{{ SITE_TAGLINE }}</p>
            <template v-if="SITE_BIO_PARAGRAPHS.length">
              <p
                v-for="(line, i) in SITE_BIO_PARAGRAPHS"
                :key="i"
                class="profile-bio"
              >
                {{ line }}
              </p>
            </template>
            <div v-if="hasContactLinks" class="profile-links">
              <div
                v-for="c in SITE_CONTACT_QR"
                :key="'qr-' + c.label"
                class="qr-chip-wrap"
                @mouseenter="onQrEnter(c.label)"
                @mouseleave="onQrLeave"
              >
                <button
                  type="button"
                  class="profile-link qr-trigger"
                  :aria-expanded="qrPopoverVisible(c.label)"
                  aria-haspopup="dialog"
                  @click="onQrToggle(c.label)"
                >
                  {{ c.label }}
                </button>
                <div
                  v-show="qrPopoverVisible(c.label)"
                  class="qr-popover"
                  role="dialog"
                  :aria-label="`${c.label}二维码`"
                  @click.stop
                >
                  <img
                    class="qr-popover-img"
                    :src="c.qr"
                    width="168"
                    height="168"
                    loading="lazy"
                    :alt="`${c.label}二维码`"
                  />
                </div>
              </div>
              <a
                v-for="link in SITE_SOCIAL_LINKS"
                :key="link.href + link.label"
                class="profile-link"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ link.label }}
              </a>
            </div>
          </div>
        </header>

        <div class="toolbar">
          <div class="search-row">
            <input
              v-model="searchDraft"
              class="search-input"
              :class="{ 'search-input--essay': isEssayMode }"
              type="search"
              :placeholder="searchPlaceholder"
              :aria-label="isEssayMode ? '在随笔中搜索' : '搜索'"
              @keydown.enter.prevent="applySearch"
            />
            <button type="button" class="btn" @click="applySearch">
              {{ isEssayMode ? '搜随笔' : '搜索' }}
            </button>
            <button
              v-if="showClearFilters"
              type="button"
              class="btn ghost"
              @click="clearFilters"
            >
              清除筛选
            </button>
          </div>
          <div v-if="tagCloudTags.length" class="tag-cloud-wrap">
            <div class="tag-cloud">
              <span class="tag-label">{{
                isEssayMode ? '随笔里的标签（可多选）' : '文章标签（可多选）'
              }}</span>
              <button
                v-for="t in displayedTagCloudTags"
                :key="t"
                type="button"
                class="cloud-tag"
                :class="{ on: activeTags.includes(t) }"
                @click="toggleTag(t)"
              >
                {{ t }}
              </button>
            </div>
            <button
              v-if="tagCloudOverflow"
              type="button"
              class="tag-cloud-toggle"
              @click="tagsExpanded = !tagsExpanded"
            >
              {{
                tagsExpanded
                  ? '收起标签'
                  : `展开全部（${tagCloudTags.length} 个）`
              }}
            </button>
          </div>
        </div>
      </div>

      <section
        id="blog-posts"
        class="blog-posts"
        :aria-label="isEssayMode ? '随笔列表' : '文章列表'"
      >
        <p v-if="err" class="err">{{ err }}</p>
        <p v-else-if="emptyListHint" class="list-empty-hint">{{ emptyListHint }}</p>

        <div v-else class="blog-list" :class="{ 'blog-list--essay': isEssayMode }">
        <article
          v-for="(p, idx) in posts"
          :key="p.id"
          class="blog-item card"
          :style="{ animationDelay: `${idx * 0.06}s` }"
        >
          <RouterLink
            class="card-link"
            :to="{ name: 'post', params: { slug: p.slug } }"
          >
            <div class="blog-header">
              <span class="blog-date"
                ><i class="icon-cal" aria-hidden="true" />{{
                  p.created_at?.slice(0, 10)
                }}</span
              >
            </div>
            <div class="blog-content">
              <h2>
                {{
                  isEssayMode && !String(p.title || '').trim()
                    ? '随笔片段'
                    : p.title || '未命名'
                }}
              </h2>
              <p v-if="p.excerpt">{{ p.excerpt }}</p>
            </div>
            <div v-if="p.tags?.length" class="blog-tags">
              <span
                v-for="(tg, ti) in p.tags"
                :key="tg"
                class="feature-tag"
                :style="{ background: tagBg(ti) }"
                >{{ tg }}</span
              >
            </div>
          </RouterLink>
        </article>
        </div>

        <nav v-if="!err && !emptyListHint && pages > 1" class="pager" aria-label="分页">
          <button
            type="button"
            class="pg"
            :disabled="page <= 1"
            @click="page = page - 1"
          >
            上一页
          </button>
          <span class="pg-info">{{ page }} / {{ pages }}（共 {{ total }} 篇）</span>
          <button
            type="button"
            class="pg"
            :disabled="page >= pages"
            @click="page = page + 1"
          >
            下一页
          </button>
        </nav>
      </section>
    </div>
  </div>
</template>

<style scoped>
.blog-list-view {
  position: relative;
  padding: 36px 20px 48px;
  min-height: calc(100vh - 55px);
  background: transparent;
  color: var(--blog-text, #8fd8f0);
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

.blog-list-view--hero {
  padding-top: 0;
}

.search-input--essay {
  border-color: rgba(255, 200, 170, 0.35);
}

.blog-list--essay .blog-item.card {
  border-color: rgba(255, 200, 170, 0.28);
}

.inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.blog-posts {
  scroll-margin-top: 58px;
}

.inner-after-hero {
  padding-top: 12px;
}

.hero-welcome {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 55px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px 0;
  box-sizing: border-box;
  text-align: center;
}

.hero-welcome-inner {
  max-width: 760px;
}

.hero-welcome-title {
  font-size: clamp(1.65rem, 5.2vw, 3rem);
  font-weight: 800;
  color: var(--blog-text-bright, #c5f1ff);
  text-shadow: var(--blog-title-shadow);
  margin: 0;
  line-height: 1.38;
  letter-spacing: 0.03em;
}

.hero-welcome-nick {
  color: var(--blog-link-pop, #b3ebff);
  padding: 0 0.15em;
}

.hero-scroll-cue {
  position: absolute;
  left: 50%;
  bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--blog-text, #8fd8f0);
  padding: 6px 20px 2px;
  font: inherit;
  line-height: 0;
}

.hero-scroll-cue:hover .hero-scroll-arrow,
.hero-scroll-cue:focus-visible .hero-scroll-arrow {
  color: var(--blog-text-bright, #c5f1ff);
}

.hero-scroll-cue:focus-visible {
  outline: 2px solid var(--blog-accent-border, rgba(100, 200, 255, 0.55));
  outline-offset: 4px;
  border-radius: 12px;
}

.hero-scroll-arrow {
  font-size: 2.35rem;
  line-height: 0.75;
  font-weight: 300;
  animation: heroScrollBounce 2.2s ease-in-out infinite;
  opacity: 0.92;
  text-shadow: var(--blog-nav-shadow);
}

.hero-welcome-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: min(180px, 26vh);
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 30, 55, 0.12) 45%,
    rgba(0, 25, 48, 0.35) 100%
  );
}

@keyframes heroScrollBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

.glass-panel {
  background: var(--blog-glass-panel-bg, rgba(255, 255, 255, 0.06));
  backdrop-filter: blur(var(--blog-glass-panel-blur, 14px)) saturate(150%);
  -webkit-backdrop-filter: blur(var(--blog-glass-panel-blur, 14px)) saturate(150%);
  border: 1px solid var(--blog-glass-panel-border, rgba(140, 220, 255, 0.32));
  border-radius: 22px;
  padding: 22px 20px 20px;
  margin-bottom: 26px;
  box-shadow: 0 8px 32px rgba(0, 25, 50, 0.15);
}

.intro .toolbar {
  margin-bottom: 0;
}

.blog-list-header {
  text-align: center;
  margin-bottom: 28px;
  animation: fadeInDown 0.75s ease-out;
}

.profile-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 20px 28px;
  text-align: left;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--blog-accent-border, rgba(100, 200, 255, 0.45));
  box-shadow: 0 4px 20px rgba(0, 30, 60, 0.35);
  flex-shrink: 0;
}

.profile-text {
  flex: 1;
  min-width: 220px;
  max-width: 520px;
  text-align: center;
}

.profile-header:not(:has(.profile-avatar)) .profile-text {
  max-width: 560px;
}

.profile-tagline {
  font-size: 1.1rem;
  color: var(--blog-text-soft, #7ecae8);
  margin: 0 0 8px;
  line-height: 1.5;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.35)
  );
}

.profile-bio {
  font-size: 0.95rem;
  color: var(--blog-profile-bio, rgba(170, 235, 255, 0.85));
  margin: 6px 0 0;
  line-height: 1.6;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.35)
  );
}

.profile-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  justify-content: center;
  margin-top: 14px;
  align-items: flex-start;
}

.qr-chip-wrap {
  position: relative;
  display: inline-block;
}

.qr-trigger.profile-link {
  cursor: pointer;
}

.qr-popover {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  padding: 12px;
  background: var(--blog-glass-panel-bg, rgba(255, 255, 255, 0.12));
  backdrop-filter: blur(var(--blog-glass-panel-blur, 14px)) saturate(150%);
  -webkit-backdrop-filter: blur(var(--blog-glass-panel-blur, 14px)) saturate(150%);
  border: 1px solid var(--blog-glass-panel-border, rgba(140, 220, 255, 0.35));
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 20, 45, 0.35);
  pointer-events: auto;
}

.qr-popover-img {
  display: block;
  width: 168px;
  height: 168px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.profile-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--blog-link-pop, #b3ebff);
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--blog-accent-border, rgba(100, 200, 255, 0.45));
  background: var(--blog-glass-muted-surface, rgba(255, 255, 255, 0.07));
  text-shadow: var(--blog-nav-shadow);
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}

.profile-link:hover {
  color: var(--blog-text-bright, #c5f1ff);
  background: rgba(100, 200, 255, 0.15);
  border-color: rgba(160, 230, 255, 0.55);
}

.blog-list-header .profile-site-heading {
  font-size: 2.5rem;
  color: var(--blog-text-bright, #c5f1ff);
  margin: 0 0 10px;
  text-shadow: var(--blog-title-shadow);
  font-weight: 800;
}

.blog-list-header p:not(.profile-bio):not(.profile-tagline) {
  font-size: 1.1rem;
  color: var(--blog-text, #8fd8f0);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.5;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.35)
  );
}

.toolbar {
  margin-bottom: 24px;
}

.search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.search-input {
  flex: 1;
  min-width: 200px;
  max-width: 360px;
  padding: 10px 14px;
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.26));
  border-radius: 12px;
  font-size: 0.95rem;
  background: var(--blog-glass-input-bg, rgba(255, 255, 255, 0.09));
  color: var(--blog-text-bright, #c5f1ff);
  backdrop-filter: blur(10px);
}
.search-input::placeholder {
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.7));
}

.btn {
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  background: rgba(30, 136, 229, 0.75);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(13, 71, 161, 0.25);
}

.btn.ghost {
  background: var(--blog-glass-muted-surface, rgba(255, 255, 255, 0.07));
  color: var(--blog-text, #8fd8f0);
  border-color: var(--blog-accent-border, rgba(100, 200, 255, 0.4));
  text-shadow: var(--blog-nav-shadow);
  box-shadow: none;
}

.tag-cloud-wrap {
  margin-top: 14px;
  width: 100%;
  max-width: 100%;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 0;
}

.tag-cloud-toggle {
  display: block;
  margin: 10px auto 0;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.35));
  background: var(--blog-glass-muted-surface, rgba(255, 255, 255, 0.06));
  color: var(--blog-link-pop, #b3ebff);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-shadow: var(--blog-nav-shadow);
}

.tag-cloud-toggle:hover {
  border-color: rgba(100, 200, 255, 0.5);
  background: rgba(100, 200, 255, 0.12);
}

.tag-label {
  font-size: 0.8rem;
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.7));
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.9),
    0 1px 2px rgba(0, 0, 0, 0.3)
  );
}

.cloud-tag {
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.26));
  background: var(--blog-glass-muted-surface, rgba(255, 255, 255, 0.07));
  backdrop-filter: blur(8px);
  cursor: pointer;
  color: var(--blog-text, #8fd8f0);
  text-shadow: var(--blog-nav-shadow);
}

.cloud-tag.on {
  border-color: rgba(100, 200, 255, 0.55);
  background: rgba(100, 200, 255, 0.18);
  color: var(--blog-text-bright, #c5f1ff);
}

.blog-list {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
  padding: 12px 0 24px;
}

.blog-item.card {
  width: 360px;
  max-width: 100%;
  background: var(--blog-glass-card-bg, rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(var(--blog-glass-card-blur, 12px)) saturate(150%);
  -webkit-backdrop-filter: blur(var(--blog-glass-card-blur, 12px)) saturate(150%);
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.26));
  border-radius: 18px;
  box-shadow: 0 8px 28px rgba(0, 25, 50, 0.12);
  overflow: hidden;
  opacity: 0;
  transform: translateY(18px);
  animation: fadeInUp 0.55s ease forwards;
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease;
}

.blog-item.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 14px 40px rgba(0, 40, 80, 0.2);
  border-color: rgba(140, 220, 255, 0.45);
}

.card-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.blog-header {
  display: flex;
  justify-content: space-between;
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--blog-accent-border, rgba(100, 200, 255, 0.25));
}

.blog-date {
  font-size: 0.85rem;
  color: var(--blog-text-soft, #7ecae8);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.35)
  );
}

.icon-cal::before {
  content: '📅';
  font-style: normal;
}

.blog-content {
  padding: 18px 20px;
  flex: 1;
}

.blog-content h2 {
  margin: 0 0 12px;
  font-size: 1.45rem;
  color: var(--blog-text-bright, #c5f1ff);
  text-shadow: var(--blog-title-shadow);
  transition: color 0.25s ease;
}

.blog-item.card:hover .blog-content h2 {
  color: var(--blog-link-pop, #b3ebff);
}

.blog-content p {
  color: var(--blog-body-on-glass, #9ee8ff);
  line-height: 1.65;
  margin: 0;
  font-size: 0.95rem;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.35)
  );
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 18px 18px;
}

.feature-tag {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  color: #fff;
  opacity: 0.95;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.pg {
  padding: 8px 16px;
  border: 1px solid var(--blog-accent-border, rgba(100, 200, 255, 0.35));
  border-radius: 12px;
  background: var(--blog-glass-muted-surface, rgba(255, 255, 255, 0.07));
  color: var(--blog-text, #8fd8f0);
  text-shadow: var(--blog-nav-shadow);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 0.875rem;
}

.pg:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pg-info {
  font-size: 0.875rem;
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.7));
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.9),
    0 1px 2px rgba(0, 0, 0, 0.3)
  );
}

.err {
  text-align: center;
  color: #c62828;
  font-weight: 600;
}

.list-empty-hint {
  text-align: center;
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.85));
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 2rem 1rem 1rem;
  max-width: 28rem;
  margin: 0 auto;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色：颜色由 .blog-root 上 CSS 变量统一切换，此处只补结构 */
:global(html.dark) .blog-item.card {
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.4);
}

:global(html.dark) .blog-item.card:hover {
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.5);
}

:global(html.dark) .glass-panel {
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.35);
}

:global(html.dark) .hero-welcome-fade {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.45) 100%
  );
}

@media (max-width: 768px) {
  .blog-list-view {
    padding: 20px 14px 36px;
  }
  .blog-list-view--hero {
    padding-top: 0;
  }
  .blog-list {
    gap: 22px;
  }
  .blog-list-header .profile-site-heading {
    font-size: 2rem;
  }
  .hero-welcome {
    min-height: calc(100dvh - 55px);
  }
}
</style>
