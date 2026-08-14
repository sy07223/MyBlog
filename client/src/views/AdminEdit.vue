<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'adminNew')

const title = ref('')
usePageTitle(() => (isNew.value ? '写文章' : title.value || '编辑文章'))
const slug = ref('')
const content = ref('')
const tags = ref('')
const published = ref(true)
const err = ref('')
const loading = ref(false)

function slugFromTitle() {
  slug.value = title.value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function load() {
  if (isNew.value) {
    title.value = ''
    slug.value = ''
    content.value = ''
    tags.value = ''
    published.value = true
    return
  }
  loading.value = true
  err.value = ''
  try {
    const { data } = await http.get(`/api/admin/posts/${route.params.id}`)
    title.value = data.title
    slug.value = data.slug
    content.value = data.content
    tags.value = data.tags || ''
    published.value = !!data.published
  } catch (e) {
    if (e.response?.status === 401) {
      await router.replace({
        name: 'adminLogin',
        query: { redirect: route.fullPath },
      })
      return
    }
    err.value = e.response?.data?.error || 'Load failed'
  } finally {
    loading.value = false
  }
}

watch(() => [route.params.id, route.name], load, { immediate: true })

async function save() {
  err.value = ''
  loading.value = true
  const body = {
    title: title.value,
    slug: slug.value,
    content: content.value,
    tags: tags.value,
    published: published.value,
  }
  try {
    if (isNew.value) {
      await http.post('/api/admin/posts', body)
    } else {
      await http.put(`/api/admin/posts/${route.params.id}`, body)
    }
    await router.push('/admin/posts')
  } catch (e) {
    if (e.response?.status === 401) {
      await router.replace({
        name: 'adminLogin',
        query: { redirect: route.fullPath },
      })
      return
    }
    err.value = e.response?.data?.error || 'Save failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <header class="bar">
      <RouterLink to="/admin/posts">Back</RouterLink>
      <RouterLink to="/admin/guestbook">留言</RouterLink>
      <RouterLink to="/admin/projects">项目</RouterLink>
      <h1>{{ isNew ? 'New post' : 'Edit post' }}</h1>
    </header>
    <p v-if="loading && !isNew && !title" class="muted">Loading...</p>
    <form v-else class="form" @submit.prevent="save">
      <label>
        Title
        <input v-model="title" required />
      </label>
      <label>
        <span class="label-row">
          <span>slug（唯一，用于 URL）</span>
          <button type="button" class="mini" @click.prevent="slugFromTitle">从标题生成</button>
        </span>
        <input v-model="slug" required pattern="[^\s/]+" title="勿含空格或斜杠" />
      </label>
      <label>
        标签（英文逗号分隔，勿在单个标签内使用逗号）
        <input v-model="tags" type="text" placeholder="例：随笔, 前端" />
      </label>
      <label>
        Body (Markdown)
        <textarea v-model="content" rows="18" required />
      </label>
      <label class="row">
        <input v-model="published" type="checkbox" />
        Published
      </label>
      <p v-if="err" class="err">{{ err }}</p>
      <button type="submit" :disabled="loading">Save</button>
    </form>
  </div>
</template>

<style scoped>
.page { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
.bar { margin-bottom: 1.5rem; }
.bar a { color: #2563eb; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; }
.bar h1 { margin: 0; font-size: 1.25rem; }
.form { display: flex; flex-direction: column; gap: 1rem; }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.875rem; color: #444; }
.row { flex-direction: row; align-items: center; gap: 0.5rem; }
input[type='text'], textarea { padding: 0.5rem 0.65rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; font-family: inherit; }
textarea { font-family: ui-monospace, monospace; line-height: 1.5; }
button[type='submit'] { align-self: flex-start; padding: 0.55rem 1.25rem; border: none; border-radius: 6px; background: #2563eb; color: #fff; font-size: 1rem; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.err { color: #b91c1c; margin: 0; }
.muted { color: #888; }
.label-row { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.mini { font-size: 0.75rem; padding: 0.2rem 0.5rem; border: 1px solid #ccc; border-radius: 4px; background: #fafafa; cursor: pointer; }
.mini:hover { background: #f0f0f0; }
</style>
