<script setup>
import { RouterLink } from 'vue-router'
import { usePageTitle } from '../composables/usePageTitle.js'
import SakuraLayer from '../components/SakuraLayer.vue'

usePageTitle(() => '404')
</script>

<template>
  <div class="wrap">
    <SakuraLayer />
    <div class="box">
      <h1>404</h1>
      <p>页面不存在。</p>
      <RouterLink to="/">返回首页</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
  min-height: calc(100vh - 55px);
  padding: 48px 16px;
  background: transparent;
  overflow: hidden;
  color: var(--blog-text, #8fd8f0);
}
.box {
  position: relative;
  z-index: 1;
  max-width: 420px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
  background: var(--blog-glass-card-bg, rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(var(--blog-glass-card-blur, 12px)) saturate(150%);
  -webkit-backdrop-filter: blur(var(--blog-glass-card-blur, 12px)) saturate(150%);
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.26));
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 25, 50, 0.15);
}
h1 {
  margin: 0 0 0.5rem;
  font-size: 2.25rem;
  color: var(--blog-text-bright, #c5f1ff);
  text-shadow: var(--blog-title-shadow);
}
p {
  color: var(--blog-body-on-glass, #9ee8ff);
  margin-bottom: 1.5rem;
  text-shadow: var(
    --blog-body-shadow,
    0 0 1px rgba(0, 28, 52, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.35)
  );
}
a {
  color: var(--blog-link-pop, #b3ebff);
  font-weight: 600;
  text-decoration: none;
  text-shadow: var(--blog-nav-shadow);
}
a:hover {
  text-decoration: underline;
  color: var(--blog-text-bright, #c5f1ff);
}
:global(html.dark) .box {
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.4);
}
</style>
