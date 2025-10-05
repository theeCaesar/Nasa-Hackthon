<template>
  <div class="contact-view container mx-auto px-4 py-12">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Contact Us</h1>
        <p class="text-gray-400">Send us your feedback, questions, or suggestions</p>
      </div>
      
      <!-- Success Message -->
      <div v-if="success" class="success-message mb-8">
        <div class="text-4xl mb-3">✅</div>
        <p class="text-lg font-semibold">Message sent successfully!</p>
        <p class="text-sm text-gray-300 mt-2">We'll get back to you soon.</p>
        <button @click="resetForm" class="mt-4 text-space-blue hover:underline">
          Send another message
        </button>
      </div>
      
      <!-- Contact Form -->
      <div v-else class="form-container">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="!authStore.isAuthenticated">
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="your.email@example.com"
            />
            <p class="text-xs text-gray-500 mt-1">
              Required for anonymous users
            </p>
          </div>
          
          <div v-else class="info-box">
            <p class="text-sm text-gray-300">
              Logged in as <span class="font-semibold text-white">{{ authStore.user?.username }}</span>
            </p>
          </div>
          
          <div>
            <label for="message" class="block text-sm font-medium text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              v-model="form.message"
              required
              rows="8"
              class="input-field"
              placeholder="Tell us what's on your mind..."
            ></textarea>
          </div>
          
          <div v-if="error" class="text-red-400 bg-red-900/20 p-3 rounded-lg">
            {{ error }}
          </div>
          
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full"
          >
            {{ loading ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      </div>
      
      <!-- Contact Info -->
      <div class="mt-12 text-center">
        <h3 class="text-xl font-semibold text-white mb-4">Other Ways to Connect</h3>
        <div class="flex justify-center space-x-8 text-gray-400">
          <div>
            <div class="text-3xl mb-2">📧</div>
            <p class="text-sm">Email</p>
          </div>
          <div>
            <div class="text-3xl mb-2">🐦</div>
            <p class="text-sm">Twitter</p>
          </div>
          <div>
            <div class="text-3xl mb-2">💼</div>
            <p class="text-sm">LinkedIn</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/axios'
import { API_ENDPOINTS } from '@/config/api'

const authStore = useAuthStore()

const form = ref({
  email: '',
  message: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = ''
  
  try {
    const payload: any = {
      message: form.value.message
    }
    
    // Only include email if user is not authenticated
    if (!authStore.isAuthenticated) {
      payload.email = form.value.email
    }
    
    await apiClient.post(API_ENDPOINTS.CONTACT, payload)
    
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to send message. Please try again.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    email: '',
    message: ''
  }
  success.value = false
  error.value = ''
}
</script>

<style scoped>
.form-container {
  @apply bg-space-dark p-8 rounded-xl border border-space-blue/30;
}

.info-box {
  @apply bg-space-blue/10 border border-space-blue/30 p-4 rounded-lg;
}

.input-field {
  @apply w-full px-4 py-3 bg-space-darker border border-space-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-space-blue transition-colors;
}

.btn-primary {
  @apply bg-space-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.success-message {
  @apply bg-green-900/20 border border-green-600/30 p-8 rounded-xl text-center text-green-400;
}
</style>

