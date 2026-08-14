<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'

usePageTitle(() => '项目管理')

const router = useRouter()
const projects = ref([])
const q = ref('')
const err = ref('')
const loading = ref(false)

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  if (!keyword) return projects.value
  return projects.value.filter((project) =>
    [project.name, project.slug, project.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  )
})

function logout() {
  localStorage.removeItem('blog_token')
  router.push('/admin/login')
}

async function load() {
  loading.value = true
  err.value = ''
  try {
    const { data } = await http.get('/api/admin/projects')
    projects.value = Array.isArray(data) ? data : []
  } catch (e) {
    if (e.response?.status === 401) return
    err.value = e.response?.data?.error || '加载项目失败'
  } finally {
    loading.value = false
  }
}

async function removeProject(project) {
  if (!confirm(`确定删除项目「${project.name}」吗？`)) return
  try {
    await http.delete(`/api/admin/projects/${project.id}`)
    projects.value = projects.value.filter((item) => item.id !== project.id)
  } catch (e) {
    alert(e.response?.data?.error || '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <header class="bar">
      <h1>项目管理</h1>
      <div class="actions">
        <input
          v-model="q"
          class="search"
          type="search"
          placeholder="搜索项目…"
          aria-label="搜索项目"
        />
        <RouterLink to="/admin/posts">文章管理</RouterLink>
        <RouterLink to="/admin/guestbook">留言管理</RouterLink>
        <RouterLink to="/">站点首页</RouterLink>
        <RouterLink to="/admin/projects/new" class="primary">新增项目</RouterLink>
        <button type="button" class="ghost" @click="logout">退出</button>
      </div>
    </header>

    <p v-if="loading" class="muted">加载中…</p>
    <p v-else-if="err" class="err">{{ err }}</p>
    <p v-else-if="filtered.length === 0" class="muted">暂无项目。</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>项目</th>
          <th>状态</th>
          <th>精选</th>
          <th>发布</th>
          <th>排序</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in filtered" :key="project.id">
          <td>
            <RouterLink :to="`/admin/projects/${project.id}`">
              {{ project.name }}
            </RouterLink>
            <div class="mono">{{ project.slug }}</div>
          </td>
          <td>{{ project.status || '—' }}</td>
          <td>{{ project.featured ? '是' : '否' }}</td>
          <td>{{ project.published ? '是' : '否' }}</td>
          <td>{{ project.sort_order }}</td>
          <td class="right">
            <RouterLink class="link" :to="`/admin/projects/${project.id}`">
              编辑
            </RouterLink>
            <button type="button" class="link danger" @click="removeProject(project)">
              删除
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.page { max-width: 1080px; margin: 0 auto; padding: 2rem 1rem; }
.bar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.bar h1 { margin: 0; font-size: 1.25rem; }
.actions { display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.actions a { color: #2563eb; text-decoration: none; }
.actions a.primary { padding: 0.45rem 0.75rem; border-radius: 6px; background: #2563eb; color: #fff; }
.search { padding: 0.4rem 0.6rem; border: 1px solid #ccc; border-radius: 6px; font-size: 0.875rem; min-width: 12rem; }
.ghost { background: transparent; border: 1px solid #ccc; padding: 0.4rem 0.75rem; border-radius: 6px; cursor: pointer; }
.table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { text-align: left; padding: 0.7rem 0.5rem; border-bottom: 1px solid #eee; vertical-align: top; }
.mono { margin-top: 0.25rem; color: #888; font-family: ui-monospace, monospace; font-size: 0.78rem; }
.right { text-align: right; white-space: nowrap; }
.link { margin-left: 0.65rem; border: 0; background: none; color: #2563eb; cursor: pointer; padding: 0; text-decoration: none; }
.link.danger { color: #b91c1c; }
.err { color: #b91c1c; }
.muted { color: #888; }
@media (max-width: 760px) { .bar { align-items: flex-start; flex-direction: column; } .actions { justify-content: flex-start; } .table { display: block; overflow-x: auto; white-space: nowrap; } }
</style>
