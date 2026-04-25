import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresGuest?: boolean
    roles?: UserRole[]
    layout?: 'default' | 'auth'
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'EventLab — Konferensiyalar platformasi' },
  },
  {
    path: '/conferences',
    name: 'conferences',
    component: () => import('@/views/ConferenceListView.vue'),
    meta: { title: 'Konferensiyalar · EventLab' },
  },
  {
    path: '/conferences/:id',
    name: 'conference-detail',
    component: () => import('@/views/ConferenceDetailView.vue'),
    meta: { title: 'Konferensiya · EventLab' },
    props: true,
  },
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: 'Kirish · EventLab',
      requiresGuest: true,
      layout: 'auth',
    },
  },
  {
    path: '/auth/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      title: "Ro'yxatdan o'tish · EventLab",
      requiresGuest: true,
      layout: 'auth',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      title: 'Boshqaruv paneli · EventLab',
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: 'Profil · EventLab',
      requiresAuth: true,
    },
  },
  {
    path: '/organizer/conferences/new',
    name: 'conference-create',
    component: () => import('@/views/ConferenceCreateView.vue'),
    meta: {
      title: 'Yangi konferensiya · EventLab',
      requiresAuth: true,
      roles: ['ADMIN', 'ORGANIZER'],
    },
  },
  {
    path: '/organizer/conferences/:id/edit',
    name: 'conference-edit',
    component: () => import('@/views/ConferenceEditView.vue'),
    meta: {
      title: 'Konferensiyani tahrirlash · EventLab',
      requiresAuth: true,
      roles: ['ADMIN', 'ORGANIZER'],
    },
    props: true,
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: {
      title: 'Admin panel · EventLab',
      requiresAuth: true,
      roles: ['ADMIN'],
    },
  },
  {
    path: '/certificates/:code',
    name: 'certificate-verify',
    component: () => import('@/views/CertificateVerifyView.vue'),
    meta: { title: 'Sertifikatni tekshirish · EventLab' },
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Sahifa topilmadi · EventLab' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!auth.user || !to.meta.roles.includes(auth.user.role)) {
      return { name: 'home' }
    }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta?.title
  if (typeof title === 'string') {
    document.title = title
  }
})

export default router
