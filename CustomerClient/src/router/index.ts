import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homeView',
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue')
        },
        { path: ':id', name: 'Borrow', component: () => import('../views/borrow/BorrowView.vue') },
        {
          path: '/author/:id',
          name: 'Author',
          component: () => import('../views/Author/AuthorView.vue')
        },
        {
          path: '/borrow',
          name: 'BorrowHistory',
          component: () => import('../views/borrow/BorrowHistory.vue')
        }
      ]
    },
    {
      path: '/forgotPassword',
      name: 'forgotPassword',
      component: () => import('../views/auth/ForgotPassword.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/returnEmail',
      name: 'returnEmail',
      component: () => import('../views/auth/ReturnEmail.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/passwordReset',
      name: 'resetPassword',
      component: () => import('../views/auth/PasswordReset.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },

    {
      path: '/user',
      name: 'user',
      component: () => import('../views/auth/UserView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/editUser/:id',
      name: 'editUser',
      component: () => import('../views/auth/EditUserView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/search/SearchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMath(.*)',
      name: 'notfound',
      component: () => import('../views/NotFound.vue')
    }
  ]
})

router.beforeResolve(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'home' })
  } else {
    return next()
  }
})

export default router
