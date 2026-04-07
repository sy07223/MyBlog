import axios from 'axios'
import router from '../router/index.js'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('blog_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || ''
    if (
      err.response?.status === 401 &&
      !url.includes('/api/auth/login') &&
      !url.includes('/api/guestbook') &&
      router.currentRoute.value.name !== 'adminLogin'
    ) {
      localStorage.removeItem('blog_token')
      router.replace({
        name: 'adminLogin',
        query: { redirect: router.currentRoute.value.fullPath },
      })
    }
    return Promise.reject(err)
  }
)

export default http