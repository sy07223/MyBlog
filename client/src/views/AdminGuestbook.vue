<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'

usePageTitle(() => '留言管理')

const router = useRouter()
const items = ref([])
const err = ref('')

const sorted = computed(() => {
  const list = [...items.value]
  return list.sort((a, b) => {
    const ta = new Date(a.created_at).getTime()
    const tb = new Date(b.created_at).getTime()
    return tb - ta
  })
})

function logout() {
  localStorage.removeItem('blog_token')
  router.push('/admin/login')
}

async function load() {
  err.value = ''
  try {
    const { data } = await http.get('/api/admin/guestbook')
    items.value = data.items || []
  } catch (e) {
    if (e.response?.status === 401) return
    err.value = e.response?.data?.error || '加载失败'
  }
}

async function patch(id, body) {
  try {
    await http.patch(`/api/admin/guestbook/${id}`, body)
    await load()
  } catch (e) {
    alert(e.response?.data?.error || '操作失败')
  }
}

async function remove(id) {
  if (!confirm('删除这条及下属回复？')) return
  try {
    await http.delete(`/api/admin/guestbook/${id}`)
    await load()
  } catch (e) {
    alert(e.response?.data?.error || '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <header class="bar">
      <h1>留言管理</h1>
      <div class="actions">
        <RouterLink to="/admin/posts">文章管理</RouterLink>
        <RouterLink to="/admin/projects">项目管理</RouterLink>
        <RouterLink to="/">站点首页</RouterLink>
        <button type="button" class="ghost" @click="logout">Logout</button>
      </div>
    </header>
    <p v-if="err" class="err">{{ err }}</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>类型</th>
          <th>昵称</th>
          <th>内容</th>
          <th>审</th>
          <th>顶</th>
          <th>时间</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sorted" :key="row.id" :class="{ sub: row.parent_id }">
          <td class="mono">{{ row.id }}</td>
          <td>{{ row.parent_id ? `回#${row.parent_id}` : '主楼' }}</td>
          <td>{{ row.nickname }}</td>
          <td class="content">{{ row.content }}</td>
          <td>
            <button
              type="button"
              class="link"
              @click="patch(row.id, { approved: !row.approved })"
            >
              {{ row.approved ? '隐藏' : '通过' }}
            </button>
          </td>
          <td>
            <template v-if="!row.parent_id">
              <button
                type="button"
                class="link pin"
                @click="patch(row.id, { pinned: !row.pinned })"
              >
                {{ row.pinned ? '取消置顶' : '置顶' }}
              </button>
            </template>
            <span v-else class="muted">—</span>
          </td>
          <td class="mono small">{{ String(row.created_at).slice(0, 16).replace('T', ' ') }}</td>
          <td class="right">
            <button type="button" class="link" @click="remove(row.id)">删</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!err && !sorted.length" class="muted">暂无留言</p>
  </div>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.bar h1 {
  margin: 0;
  font-size: 1.25rem;
}
.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.actions a {
  color: #2563eb;
  text-decoration: none;
}
.ghost {
  background: transparent;
  border: 1px solid #ccc;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
th,
td {
  text-align: left;
  padding: 0.5rem 0.35rem;
  border-bottom: 1px solid #eee;
  vertical-align: top;
}
tr.sub td {
  background: #fafafa;
}
.content {
  max-width: 280px;
  word-break: break-word;
  white-space: pre-wrap;
}
.mono {
  font-family: ui-monospace, monospace;
  color: #666;
}
.small {
  font-size: 0.75rem;
  white-space: nowrap;
}
.right {
  text-align: right;
}
.link {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}
.link.pin {
  color: #b45309;
}
.err {
  color: #b91c1c;
}
.muted {
  color: #888;
  font-size: 0.9rem;
}
</style>
