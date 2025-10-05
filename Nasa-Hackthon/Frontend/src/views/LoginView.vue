<template>
  <div class="auth-view min-h-screen flex items-center justify-center px-4 py-12">
    <div class="auth-container max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Welcome Back</h1>
        <p class="text-gray-400">Log in to access your resources</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="input-field"
            placeholder="Enter your username"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="input-field"
            placeholder="Enter your password"
          />
        </div>
        
        <div v-if="error" class="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
          {{ error }}
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="btn-submit w-full"
        >
          {{ loading ? 'Logging in...' : 'Log In' }}
        </button>
      </form>
      
      <div class="mt-6 text-center text-gray-400">
        Don't have an account?
        <router-link to="/signup" class="text-space-blue hover:underline ml-1">Sign up</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/axios'
import { API_ENDPOINTS } from '@/config/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, form.value)
    
    if (response.data.status === 'success') {
      authStore.setAuth(response.data.token, response.data.data.user)
      
      const redirect = route.query.redirect as string || '/'
      router.push(redirect)
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  @apply bg-space-dark p-8 rounded-2xl border border-space-blue/30 shadow-2xl;
}

.input-field {
  @apply w-full px-4 py-3 bg-space-darker border border-space-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-space-blue transition-colors;
}

.btn-submit {
  @apply bg-space-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>

