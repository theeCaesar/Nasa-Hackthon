<template>
  <div class="search-view container mx-auto px-4 py-12">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-8 text-center">Semantic Search</h1>
      
      <!-- Search Form -->
      <div class="search-container mb-8">
        <form @submit.prevent="handleSearch" class="space-y-6">
          <div class="flex gap-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for space biology publications..."
              class="input-field flex-1"
              required
            />
            <button type="submit" :disabled="loading" class="btn-primary px-8">
              {{ loading ? 'Searching...' : 'Search' }}
            </button>
          </div>
          
          <!-- Advanced Filters -->
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Results Limit</label>
              <input
                v-model.number="filters.limit"
                type="number"
                min="1"
                max="50"
                class="input-field"
                placeholder="10"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Year (optional)</label>
              <input
                v-model="filters.year"
                type="text"
                pattern="[0-9]{4}"
                class="input-field"
                placeholder="e.g., 2023"
              />
            </div>
            
            <div v-if="authStore.isAuthenticated" class="flex items-end">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  v-model="filters.own"
                  type="checkbox"
                  class="w-5 h-5 text-space-blue bg-space-darker border-space-blue/30 rounded focus:ring-space-blue"
                />
                <span class="text-gray-300">My resources only</span>
              </label>
            </div>
          </div>
        </form>
      </div>
      
      <!-- Error Message -->
      <div v-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg mb-8">
        {{ error }}
      </div>
      
      <!-- Search Results -->
      <div v-if="results.length > 0" class="results-section">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-white">
            Found {{ results.length }} results for "{{ lastQuery }}"
          </h2>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="result in results"
            :key="result.id"
            class="result-card"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-xl font-semibold text-white flex-1 pr-4">{{ result.title }}</h3>
              <span class="score-badge">{{ (result.score * 100).toFixed(0) }}% match</span>
            </div>
            
            <a
              v-if="result.link"
              :href="result.link"
              target="_blank"
              rel="noopener noreferrer"
              class="text-space-blue hover:underline text-sm mb-4 inline-block"
            >
              {{ result.link }} ↗
            </a>
            
            <div class="flex gap-3 mt-4">
              <router-link
                :to="{ name: 'summary', params: { id: result.id } }"
                class="btn-small"
              >
                📝 Summarize
              </router-link>
              <router-link
                :to="{ name: 'study-cards', params: { id: result.id } }"
                class="btn-small"
              >
                🎓 Study Cards
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="!loading && searchQuery && !error" class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <p class="text-gray-400 text-lg">No results found. Try a different query.</p>
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

const searchQuery = ref('')
const lastQuery = ref('')
const filters = ref({
  limit: 50,
  year: '',
  own: false
})

const results = ref<any[]>([])
const loading = ref(false)
const error = ref('')

async function handleSearch() {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  error.value = ''
  lastQuery.value = searchQuery.value
  
  try {
    const params: any = {
      q: searchQuery.value,
      limit: filters.value.limit
    }
    
    if (filters.value.year) {
      params.year = filters.value.year
    }
    
    if (filters.value.own && authStore.isAuthenticated) {
      params.own = 'false'
    }
    
    const response = await apiClient.get(API_ENDPOINTS.SEARCH, { params })
    results.value = response.data.results || []
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Search failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.search-container {
  @apply bg-space-dark p-6 rounded-xl border border-space-blue/30;
}

.input-field {
  @apply w-full px-4 py-3 bg-space-darker border border-space-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-space-blue transition-colors;
}

.btn-primary {
  @apply bg-space-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.result-card {
  @apply bg-space-dark p-6 rounded-xl border border-space-blue/30 hover:border-space-blue transition-all duration-200;
}

.score-badge {
  @apply bg-space-blue/20 text-space-blue px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap;
}

.btn-small {
  @apply bg-space-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-space-blue transition-colors;
}
</style>

