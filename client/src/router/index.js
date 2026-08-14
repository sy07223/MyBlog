import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/post/:slug', name: 'post', component: () => import('../views/PostView.vue') },
  {
    path: '/guestbook',
    name: 'guestbook',
    component: () => import('../views/GuestbookView.vue'),
  },
  {
    path: '/admin/login',
    name: 'adminLogin',
    component: () => import('../views/AdminLogin.vue'),
  },
  {
    path: '/admin/posts',
    name: 'adminPosts',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminList.vue'),
  },
  {
    path: '/admin/guestbook',
    name: 'adminGuestbook',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminGuestbook.vue'),
  },
  {
    path: '/admin/projects',
    name: 'adminProjects',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminProjects.vue'),
  },
  {
    path: '/admin/posts/new',
    name: 'adminNew',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminEdit.vue'),
  },
  {
    path: '/admin/posts/:id',
    name: 'adminEdit',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminEdit.vue'),
  },
  {
    path: '/admin/projects/new',
    name: 'adminProjectNew',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminProjectEdit.vue'),
  },
  {
    path: '/admin/projects/:id',
    name: 'adminProjectEdit',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminProjectEdit.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 58,
      }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  const token = localStorage.getItem('blog_token')
  if (to.meta.requiresAuth && !token) {
    return {
      name: 'adminLogin',
      query: { redirect: to.fullPath },
    }
  }
  if (to.name === 'adminLogin' && token) {
    return { path: '/admin/posts' }
  }
  return true
})

export default router
