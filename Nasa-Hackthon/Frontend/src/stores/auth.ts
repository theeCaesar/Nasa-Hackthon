import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<any>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(newToken: string, userData: any) {
    token.value = newToken
    user.value = userData
    localStorage.setItem('auth_token', newToken)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }

  function getAuthHeader() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
    getAuthHeader,
  }
})

