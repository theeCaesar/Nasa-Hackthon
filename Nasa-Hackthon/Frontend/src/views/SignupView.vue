<template>
  <div class="auth-view min-h-screen flex items-center justify-center px-4 py-12">
    <div class="auth-container max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Create Account</h1>
        <p class="text-gray-400">Join the space biology community</p>
      </div>
      
      <form @submit.prevent="handleSignup" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Username *</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="input-field"
            placeholder="Choose a username"
          />
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input-field"
            placeholder="your.email@example.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password *</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="input-field"
            placeholder="Create a password (min. 6 characters)"
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
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>
      
      <div class="mt-6 text-center text-gray-400">
        Already have an account?
        <router-link to="/login" class="text-space-blue hover:underline ml-1">Log in</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/axios'
import { API_ENDPOINTS } from '@/config/api'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function handleSignup() {
  loading.value = true
  error.value = ''
  
  try {
    const payload: any = {
      username: form.value.username,
      password: form.value.password
    }
    
    if (form.value.email) {
      payload.email = form.value.email
    }
    
    const response = await apiClient.post(API_ENDPOINTS.SIGNUP, payload)
    
    if (response.data.status === 'success') {
      authStore.setAuth(response.data.token, response.data.data.user)
      router.push('/')
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Signup failed. Please try again.'
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

