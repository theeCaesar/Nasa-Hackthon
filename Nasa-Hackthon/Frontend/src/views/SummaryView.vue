<template>
  <div class="summary-view container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-8 text-center">AI Summarizer</h1>
      
      <!-- Mode Toggle -->
      <div class="mode-toggle mb-8">
        <button
          @click="mode = 'id'"
          :class="{ active: mode === 'id' }"
          class="toggle-btn"
        >
          By Publication ID
        </button>
        <button
          @click="mode = 'text'"
          :class="{ active: mode === 'text' }"
          class="toggle-btn"
        >
          Custom Text
        </button>
      </div>
      
      <!-- By ID Form -->
      <div v-if="mode === 'id'" class="form-container">
        <form @submit.prevent="summarizeById" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Publication ID</label>
            <input
              v-model="publicationId"
              type="text"
              required
              class="input-field"
              placeholder="Enter publication ID (e.g., from search results)"
            />
          </div>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Style</label>
              <select v-model="style" class="input-field">
                <option value="expert">Expert (Technical)</option>
                <option value="student">Student (Simplified)</option>
              </select>
            </div>
            
            <div class="flex items-end">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  v-model="force"
                  type="checkbox"
                  class="w-5 h-5 text-space-blue bg-space-darker border-space-blue/30 rounded"
                />
                <span class="text-gray-300">Force regenerate</span>
              </label>
            </div>
          </div>
          
          <button type="submit" :disabled="loading" class="btn-primary w-full">
            {{ loading ? 'Generating...' : 'Generate Summary' }}
          </button>
        </form>
      </div>
      
      <!-- Custom Text Form -->
      <div v-else class="form-container">
        <form @submit.prevent="summarizeText" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              v-model="customText.title"
              type="text"
              required
              class="input-field"
              placeholder="Enter the title"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Text to Summarize</label>
            <textarea
              v-model="customText.text"
              required
              rows="8"
              class="input-field"
              placeholder="Paste the text content here..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Style</label>
            <select v-model="customText.style" class="input-field">
              <option value="expert">Expert (Technical)</option>
              <option value="student">Student (Simplified)</option>
            </select>
          </div>
          
          <button type="submit" :disabled="loading" class="btn-primary w-full">
            {{ loading ? 'Generating...' : 'Generate Summary' }}
          </button>
        </form>
      </div>
      
      <!-- Error Message -->
      <div v-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg mt-6">
        {{ error }}
      </div>
      
      <!-- Summary Result -->
      <div v-if="summary" class="result-container mt-8">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-semibold text-white">{{ summary.title }}</h2>
          <span class="style-badge">{{ summary.style }}</span>
        </div>
        
        <div class="summary-content whitespace-pre-line">
          {{ summary.summary }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/api/axios'
import { API_ENDPOINTS } from '@/config/api'

const route = useRoute()

const mode = ref<'id' | 'text'>('id')
const publicationId = ref('')
const style = ref('expert')
const force = ref(false)

const customText = ref({
  title: '',
  text: '',
  style: 'expert'
})

const summary = ref<any>(null)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (route.params.id) {
    publicationId.value = route.params.id as string
  }
})

async function summarizeById() {
  loading.value = true
  error.value = ''
  summary.value = null
  
  try {
    const params = {
      style: style.value,
      force: force.value
    }
    
    const response = await apiClient.get(
      API_ENDPOINTS.SUMMARIZE_BY_ID(publicationId.value),
      { params }
    )
    
    summary.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to generate summary.'
  } finally {
    loading.value = false
  }
}

async function summarizeText() {
  loading.value = true
  error.value = ''
  summary.value = null
  
  try {
    const response = await apiClient.post(API_ENDPOINTS.SUMMARIZE, customText.value)
    summary.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to generate summary.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mode-toggle {
  @apply flex justify-center gap-4;
}

.toggle-btn {
  @apply px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-space-dark text-gray-400 border border-space-blue/30;
}

.toggle-btn.active {
  @apply bg-space-blue text-white border-space-blue;
}

.form-container {
  @apply bg-space-dark p-6 rounded-xl border border-space-blue/30;
}

.input-field {
  @apply w-full px-4 py-3 bg-space-darker border border-space-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-space-blue transition-colors;
}

.btn-primary {
  @apply bg-space-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.result-container {
  @apply bg-space-dark p-8 rounded-xl border border-space-blue/30;
}

.style-badge {
  @apply bg-space-blue/20 text-space-blue px-3 py-1 rounded-full text-sm font-semibold uppercase;
}

.summary-content {
  @apply text-gray-300 leading-relaxed mt-4 text-lg;
}
</style>

