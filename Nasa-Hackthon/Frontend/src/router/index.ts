import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import SearchView from '@/views/SearchView.vue'
import SummaryView from '@/views/SummaryView.vue'
import ChatView from '@/views/ChatView.vue'
import StudyCardsView from '@/views/StudyCardsView.vue'
import StatsView from '@/views/StatsView.vue'
import ResourcesView from '@/views/ResourcesView.vue'
import ContactView from '@/views/ContactView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/summary/:id?',
      name: 'summary',
      component: SummaryView,
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
    },
    {
      path: '/study-cards/:id?',
      name: 'study-cards',
      component: StudyCardsView,
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
    },
    {
      path: '/resources',
      name: 'resources',
      component: ResourcesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
  ],
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
