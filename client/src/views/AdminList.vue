<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'

usePageTitle(() => '文章管理')

const router = useRouter()
const posts = ref([])
const err = ref('')
const q = ref('')

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return posts.value
  return posts.value.filter(
    (p) =>
      p.title.toLowerCase().includes(s) ||
      String(p.slug).toLowerCase().includes(s)
  )
})

function logout() {
  localStorage.removeItem('blog_token')
  router.push('/admin/login')
}

onMounted(async () => {
  try {
    const { data } = await http.get('/api/admin/posts')
    posts.value = data
  } catch (e) {
    if (e.response?.status === 401) return
    err.value = e.response?.data?.error || 'Load failed'
  }
})

async function remove(id) {
  if (!confirm('Delete this post?')) return
  try {
    await http.delete(`/api/admin/posts/${id}`)
    posts.value = posts.value.filter((p) => p.id !== id)
  } catch (e) {
    alert(e.response?.data?.error || 'Delete failed')
  }
}
</script>

<template>
  <div class="page">
    <header class="bar">
      <h1>Posts</h1>
      <div class="actions">
        <input
          v-model="q"
          class="search"
          type="search"
          placeholder="搜索标题或 slug…"
          aria-label="搜索文章"
        />
        <RouterLink to="/">站点首页</RouterLink>
        <RouterLink to="/admin/guestbook">留言管理</RouterLink>
        <RouterLink to="/admin/posts/new">New</RouterLink>
        <button type="button" class="ghost" @click="logout">Logout</button>
      </div>
    </header>
    <p v-if="err" class="err">{{ err }}</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>slug</th>
          <th>Pub</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filtered" :key="p.id">
          <td>
            <RouterLink :to="`/admin/posts/${p.id}`">{{ p.title }}</RouterLink>
          </td>
          <td class="mono">{{ p.slug }}</td>
          <td>{{ p.published ? 'Y' : 'N' }}</td>
          <td class="right">
            <button type="button" class="link" @click="remove(p.id)">Del</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.page { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
.bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.bar h1 { margin: 0; font-size: 1.25rem; }
.actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.actions a { color: #2563eb; text-decoration: none; }
.search { padding: 0.35rem 0.6rem; border: 1px solid #ccc; border-radius: 6px; font-size: 0.875rem; min-width: 10rem; }
.ghost { background: transparent; border: 1px solid #ccc; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; }
.table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { text-align: left; padding: 0.6rem 0.5rem; border-bottom: 1px solid #eee; }
.mono { font-family: ui-monospace, monospace; color: #666; }
.right { text-align: right; }
.link { background: none; border: none; color: #b91c1c; cursor: pointer; padding: 0; }
.err { color: #b91c1c; }
</style>