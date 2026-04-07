<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import {
  BLOG_BG_URL,
  BLOG_BG_POSTER,
  isVideoBackgroundUrl,
} from './config/blogTheme.js'

const route = useRoute()
const showHeader = computed(() => !route.path.startsWith('/admin'))
const bgUrl = BLOG_BG_URL
const isVideoBg = computed(() => isVideoBackgroundUrl(bgUrl))
const videoPoster = computed(() => BLOG_BG_POSTER.trim() || undefined)
</script>

<template>
  <div class="blog-root">
    <video
      v-if="isVideoBg"
      class="blog-bg-video"
      :src="bgUrl"
      :poster="videoPoster"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
    />
    <div
      v-else
      class="blog-bg"
      :style="{ backgroundImage: `url('${bgUrl}')` }"
      role="presentation"
    />
    <div class="blog-bg-dim" aria-hidden="true" />

    <SiteHeader v-if="showHeader" />
    <div class="app-shell" :class="{ 'with-header': showHeader }">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
/* 全站主题：正文/摘要与 Logo 同色（暖象牙），标题与导航仍为亮青 */
.blog-root {
  min-height: 100vh;
  position: relative;
  /* 略加重：亮画面时减轻「蓝字糊在白底上」 */
  --blog-dim: rgba(0, 35, 60, 0.09);
  --blog-glass-panel-bg: rgba(255, 255, 255, 0.06);
  --blog-glass-panel-border: rgba(140, 220, 255, 0.32);
  --blog-glass-panel-blur: 14px;
  --blog-glass-card-bg: rgba(255, 255, 255, 0.05);
  --blog-glass-card-border: rgba(130, 210, 255, 0.26);
  --blog-glass-card-blur: 12px;
  --blog-glass-input-bg: rgba(255, 255, 255, 0.09);
  --blog-glass-muted-surface: rgba(255, 255, 255, 0.07);
  --blog-header-bg: rgba(2, 20, 45, 0.58);
  --blog-header-blur: 20px;
  /* 与左上角 Logo 同一暖象牙色：正文、摘要、简介 */
  --blog-logo-color: #fff4e8;
  --blog-logo-hover: #fffaf4;
  --blog-logo-shadow:
    0 0 1px rgba(18, 32, 52, 0.98),
    0 0 2px rgba(0, 26, 48, 0.92),
    0 0 14px rgba(0, 32, 58, 0.68),
    0 2px 5px rgba(0, 0, 0, 0.42);
  --blog-body-on-glass: var(--blog-logo-color);
  --blog-text: #efe6dc;
  --blog-text-soft: #e5d9cc;
  --blog-text-muted: rgba(255, 244, 232, 0.78);
  --blog-profile-bio: rgba(255, 244, 232, 0.94);
  /* 标题、导航旁链接等仍用亮青，和奶色正文区分 */
  --blog-text-bright: #a8e8fc;
  --blog-title-shadow:
    0 0 1px #001a2e,
    0 0 2px rgba(0, 24, 48, 0.98),
    0 0 12px rgba(0, 32, 62, 0.72),
    0 2px 5px rgba(0, 0, 0, 0.45);
  --blog-nav-text: #dff6ff;
  --blog-nav-shadow:
    0 0 1px #001a2e,
    0 0 2px rgba(0, 24, 48, 0.98),
    0 0 10px rgba(0, 32, 58, 0.78),
    0 1px 3px rgba(0, 0, 0, 0.8);
  /* 奶色字在亮底上靠深色描边稳住 */
  --blog-body-shadow:
    0 0 1px rgba(18, 24, 38, 0.92),
    0 0 6px rgba(0, 22, 42, 0.48),
    0 1px 3px rgba(0, 0, 0, 0.38);
  --blog-link-pop: #b3ebff;
  --blog-accent-border: rgba(100, 200, 255, 0.45);
}

:global(html.dark) .blog-root {
  --blog-dim: rgba(0, 4, 14, 0.38);
  --blog-glass-panel-bg: rgba(0, 18, 36, 0.2);
  --blog-glass-panel-border: rgba(100, 190, 240, 0.22);
  --blog-glass-panel-blur: 16px;
  --blog-glass-card-bg: rgba(0, 16, 32, 0.18);
  --blog-glass-card-border: rgba(90, 180, 230, 0.2);
  --blog-glass-card-blur: 14px;
  --blog-glass-input-bg: rgba(0, 24, 48, 0.35);
  --blog-glass-muted-surface: rgba(0, 30, 55, 0.32);
  --blog-header-bg: rgba(0, 10, 26, 0.78);
  --blog-header-blur: 22px;
  --blog-logo-color: #ffe8cc;
  --blog-logo-hover: #fff3e0;
  --blog-logo-shadow:
    0 0 1px rgba(0, 0, 0, 0.95),
    0 0 3px rgba(0, 0, 0, 0.82),
    0 0 14px rgba(0, 0, 0, 0.55),
    0 2px 5px rgba(0, 0, 0, 0.45);
  --blog-body-on-glass: var(--blog-logo-color);
  --blog-text: #ecd9c4;
  --blog-text-soft: #e0cbb3;
  --blog-text-muted: rgba(255, 232, 204, 0.78);
  --blog-profile-bio: rgba(255, 232, 204, 0.9);
  --blog-text-bright: #b3e5fc;
  --blog-title-shadow:
    0 0 1px rgba(0, 0, 0, 0.95),
    0 0 3px rgba(0, 0, 0, 0.85),
    0 0 14px rgba(0, 0, 0, 0.65),
    0 2px 6px rgba(0, 0, 0, 0.55);
  --blog-nav-text: #e1f5fe;
  --blog-nav-shadow:
    0 0 1px rgba(0, 0, 0, 0.95),
    0 0 8px rgba(0, 0, 0, 0.8),
    0 1px 3px rgba(0, 0, 0, 0.75);
  --blog-body-shadow:
    0 0 1px rgba(0, 0, 0, 0.88),
    0 0 8px rgba(0, 0, 0, 0.42),
    0 1px 2px rgba(0, 0, 0, 0.35);
  --blog-link-pop: #b3e5fc;
  --blog-accent-border: rgba(79, 195, 247, 0.4);
}

.blog-bg-video {
  position: fixed;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
}

.blog-bg {
  position: fixed;
  inset: 0;
  z-index: -2;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.blog-bg-dim {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: var(--blog-dim);
}

.app-shell {
  min-height: 100vh;
  box-sizing: border-box;
}

.app-shell.with-header {
  padding-top: 55px;
}
</style>
