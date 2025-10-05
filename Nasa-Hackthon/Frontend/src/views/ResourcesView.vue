<template>
  <div class="resources-view container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-8 text-center">My Resources</h1>
      
      <!-- Add Resource Form -->
      <div class="form-container mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Add New Resource</h2>
        <form @submit.prevent="addResource" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              v-model="newResource.title"
              type="text"
              required
              class="input-field"
              placeholder="Enter resource title"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Link *</label>
            <input
              v-model="newResource.link"
              type="url"
              required
              class="input-field"
              placeholder="https://example.com/resource"
            />
          </div>
          
          <button type="submit" :disabled="addingResource" class="btn-primary w-full">
            {{ addingResource ? 'Adding...' : '+ Add Resource' }}
          </button>
        </form>
        
        <div v-if="addError" class="text-red-400 bg-red-900/20 p-3 rounded-lg mt-4">
          {{ addError }}
        </div>
        
        <div v-if="addSuccess" class="text-green-400 bg-green-900/20 p-3 rounded-lg mt-4">
          Resource added successfully!
        </div>
      </div>
      
      <!-- Resources List -->
      <div class="resources-list">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-white">Your Resources</h2>
          <button @click="fetchResources" :disabled="loading" class="btn-secondary">
            🔄 Refresh
          </button>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-blue"></div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg">
          {{ error }}
        </div>
        
        <!-- Empty State -->
        <div v-else-if="resources.length === 0" class="empty-state">
          <div class="text-6xl mb-4">📚</div>
          <p class="text-gray-400 text-lg">No resources yet. Add your first one above!</p>
        </div>
        
        <!-- Resources Grid -->
        <div v-else class="space-y-4">
          <div
            v-for="resource in resources"
            :key="resource._id"
            class="resource-card"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <h3 class="text-xl font-semibold text-white mb-2">{{ resource.title }}</h3>
                <a
                  :href="resource.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-space-blue hover:underline text-sm"
                >
                  {{ resource.link }} ↗
                </a>
                <p class="text-gray-500 text-sm mt-2">
                  Added {{ formatDate(resource.createdAt) }}
                </p>
              </div>
              
              <button
                @click="deleteResource(resource._id)"
                :disabled="deletingId === resource._id"
                class="btn-danger"
              >
                {{ deletingId === resource._id ? '...' : '🗑️' }}
              </button>
            </div>
            
            <div class="flex gap-3 mt-4">
              <router-link
                :to="{ name: 'summary', params: { id: resource._id } }"
                class="btn-small"
              >
                📝 Summarize
              </router-link>
              <router-link
                :to="{ name: 'study-cards', params: { id: resource._id } }"
                class="btn-small"
              >
                🎓 Study Cards
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/api/axios'
import { API_ENDPOINTS } from '@/config/api'

const newResource = ref({
  title: '',
  link: ''
})

const resources = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const addingResource = ref(false)
const addError = ref('')
const addSuccess = ref(false)
const deletingId = ref<string | null>(null)

onMounted(() => {
  fetchResources()
})

async function fetchResources() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiClient.get(API_ENDPOINTS.RESOURCES)
    resources.value = response.data.data?.resources || []
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load resources.'
  } finally {
    loading.value = false
  }
}

async function addResource() {
  addingResource.value = true
  addError.value = ''
  addSuccess.value = false
  
  try {
    await apiClient.post(API_ENDPOINTS.RESOURCES, newResource.value)
    
    addSuccess.value = true
    newResource.value = { title: '', link: '' }
    
    // Refresh the list
    await fetchResources()
    
    setTimeout(() => {
      addSuccess.value = false
    }, 3000)
  } catch (err: any) {
    addError.value = err.response?.data?.message || 'Failed to add resource.'
  } finally {
    addingResource.value = false
  }
}

async function deleteResource(id: string) {
  if (!confirm('Are you sure you want to delete this resource?')) return
  
  deletingId.value = id
  
  try {
    await apiClient.delete(API_ENDPOINTS.RESOURCE_BY_ID(id))
    resources.value = resources.value.filter(r => r._id !== id)
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to delete resource.')
  } finally {
    deletingId.value = null
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.form-container {
  @apply bg-space-dark p-6 rounded-xl border border-space-blue/30;
}

.input-field {
  @apply w-full px-4 py-3 bg-space-darker border border-space-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-space-blue transition-colors;
}

.btn-primary {
  @apply bg-space-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-transparent border border-space-blue text-space-blue px-4 py-2 rounded-lg hover:bg-space-blue hover:text-white transition-all duration-200 disabled:opacity-50;
}

.resources-list {
  @apply bg-space-dark p-6 rounded-xl border border-space-blue/30;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.resource-card {
  @apply bg-space-navy p-6 rounded-xl border border-space-blue/30 hover:border-space-blue transition-all duration-200;
}

.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-small {
  @apply bg-space-dark text-white px-4 py-2 rounded-lg text-sm hover:bg-space-blue transition-colors;
}
</style>

