<script setup>
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'

usePageTitle(() => '登录')

const route = useRoute()
const router = useRouter()
const username = ref('')
const password = ref('')
const err = ref('')
const loading = ref(false)

async function submit() {
  err.value = ''
  loading.value = true
  try {
    const { data } = await http.post('/api/auth/login', {
      username: username.value,
      password: password.value,
    })
    localStorage.setItem('blog_token', data.token)
    const redir = route.query.redirect
    const safe =
      typeof redir === 'string' &&
      redir.startsWith('/admin') &&
      !redir.startsWith('//')
    await router.push(safe ? redir : '/admin/posts')
  } catch (e) {
    err.value = e.response?.data?.error || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <RouterLink class="back" to="/">Home</RouterLink>
    <h1>Admin login</h1>
    <form class="form" @submit.prevent="submit">
      <label>
        Username
        <input v-model="username" autocomplete="username" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>
      <p v-if="err" class="err">{{ err }}</p>
      <button type="submit" :disabled="loading">{{ loading ? '...' : 'Sign in' }}</button>
    </form>
  </div>
</template>

<style scoped>
.page { max-width: 360px; margin: 3rem auto; padding: 0 1rem; }
.back { display: inline-block; margin-bottom: 1rem; color: #2563eb; text-decoration: none; }
.form { display: flex; flex-direction: column; gap: 1rem; }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.875rem; color: #444; }
input { padding: 0.5rem 0.65rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; }
button { padding: 0.6rem; border: none; border-radius: 6px; background: #2563eb; color: #fff; font-size: 1rem; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.err { color: #b91c1c; margin: 0; font-size: 0.875rem; }
</style>