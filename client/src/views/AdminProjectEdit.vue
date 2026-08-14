<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'adminProjectNew')

const name = ref('')
const slug = ref('')
const description = ref('')
const role = ref('')
const status = ref('')
const href = ref('')
const demoUrl = ref('')
const coverUrl = ref('')
const tags = ref('')
const sortOrder = ref(0)
const featured = ref(false)
const published = ref(true)
const err = ref('')
const loading = ref(false)

usePageTitle(() => (isNew.value ? '新增项目' : name.value || '编辑项目'))

function slugFromName() {
  slug.value = name.value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function reset() {
  name.value = ''
  slug.value = ''
  description.value = ''
  role.value = ''
  status.value = ''
  href.value = ''
  demoUrl.value = ''
  coverUrl.value = ''
  tags.value = ''
  sortOrder.value = 0
  featured.value = false
  published.value = true
}

async function load() {
  err.value = ''
  if (isNew.value) {
    reset()
    return
  }

  loading.value = true
  try {
    const { data } = await http.get(`/api/admin/projects/${route.params.id}`)
    name.value = data.name || ''
    slug.value = data.slug || ''
    description.value = data.description || ''
    role.value = data.role || ''
    status.value = data.status || ''
    href.value = data.href || ''
    demoUrl.value = data.demo_url || ''
    coverUrl.value = data.cover_url || ''
    tags.value = Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || ''
    sortOrder.value = data.sort_order || 0
    featured.value = !!data.featured
    published.value = !!data.published
  } catch (e) {
    if (e.response?.status === 401) {
      await router.replace({ name: 'adminLogin', query: { redirect: route.fullPath } })
      return
    }
    err.value = e.response?.data?.error || '加载项目失败'
  } finally {
    loading.value = false
  }
}

watch(() => [route.params.id, route.name], load, { immediate: true })

async function save() {
  err.value = ''
  loading.value = true
  const body = {
    name: name.value,
    slug: slug.value,
    description: description.value,
    role: role.value,
    status: status.value,
    href: href.value,
    demo_url: demoUrl.value,
    cover_url: coverUrl.value,
    tags: tags.value,
    sort_order: sortOrder.value,
    featured: featured.value,
    published: published.value,
  }

  try {
    if (isNew.value) {
      await http.post('/api/admin/projects', body)
    } else {
      await http.put(`/api/admin/projects/${route.params.id}`, body)
    }
    await router.push('/admin/projects')
  } catch (e) {
    if (e.response?.status === 401) {
      await router.replace({ name: 'adminLogin', query: { redirect: route.fullPath } })
      return
    }
    err.value = e.response?.data?.error || '保存失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <header class="bar">
      <div class="bar-links">
        <RouterLink to="/admin/projects">返回项目</RouterLink>
        <RouterLink to="/admin/posts">文章</RouterLink>
        <RouterLink to="/admin/guestbook">留言</RouterLink>
      </div>
      <h1>{{ isNew ? '新增项目' : '编辑项目' }}</h1>
    </header>

    <p v-if="loading && !isNew && !name" class="muted">加载中…</p>
    <form v-else class="form" @submit.prevent="save">
      <div class="grid two">
        <label>
          项目名称
          <input v-model="name" required />
        </label>
        <label>
          <span class="label-row"><span>slug</span><button type="button" class="mini" @click="slugFromName">从名称生成</button></span>
          <input v-model="slug" required pattern="[^\s/]+" />
        </label>
      </div>
      <label>
        项目简介
        <textarea v-model="description" rows="4" required />
      </label>
      <div class="grid two">
        <label>你的角色<input v-model="role" placeholder="产品与开发" /></label>
        <label>项目状态<input v-model="status" placeholder="进行中 / 已完成" /></label>
        <label>排序<input v-model.number="sortOrder" type="number" min="0" /></label>
        <label>技术栈（逗号分隔）<input v-model="tags" placeholder="React, TypeScript" /></label>
      </div>
      <label>项目仓库地址<input v-model="href" type="url" placeholder="没有公开地址可留空" /></label>
      <label>在线预览地址<input v-model="demoUrl" type="url" placeholder="可选" /></label>
      <label>封面地址<input v-model="coverUrl" type="url" placeholder="可选，后续可接上传" /></label>
      <div class="checks">
        <label class="check"><input v-model="featured" type="checkbox" />精选项目</label>
        <label class="check"><input v-model="published" type="checkbox" />公开展示</label>
      </div>
      <p v-if="err" class="err">{{ err }}</p>
      <button type="submit" :disabled="loading">{{ loading ? '保存中…' : '保存项目' }}</button>
    </form>
  </div>
</template>

<style scoped>
.page { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
.bar { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
.bar h1 { margin: 0; font-size: 1.25rem; }
.bar-links { display: flex; gap: 1rem; flex-wrap: wrap; }
.bar a { color: #2563eb; text-decoration: none; }
.form { display: flex; flex-direction: column; gap: 1rem; }
.grid { display: grid; gap: 1rem; }
.grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.875rem; color: #444; }
input, textarea { width: 100%; padding: 0.55rem 0.65rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; font-family: inherit; }
textarea { resize: vertical; line-height: 1.5; }
.label-row { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.mini { font-size: 0.75rem; padding: 0.2rem 0.5rem; border: 1px solid #ccc; border-radius: 4px; background: #fafafa; cursor: pointer; }
.checks { display: flex; gap: 1.2rem; flex-wrap: wrap; }
.check { flex-direction: row; align-items: center; gap: 0.45rem; }
.check input { width: auto; }
button[type='submit'] { align-self: flex-start; padding: 0.6rem 1.3rem; border: none; border-radius: 6px; background: #2563eb; color: #fff; font-size: 1rem; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.err { color: #b91c1c; margin: 0; }
.muted { color: #888; }
@media (max-width: 680px) { .bar { flex-direction: column-reverse; } .grid.two { grid-template-columns: 1fr; } }
</style>
