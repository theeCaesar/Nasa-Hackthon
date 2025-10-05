<template>
  <div class="study-cards-view container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-8 text-center">Study Cards Generator</h1>
      
      <!-- Form -->
      <div class="form-container mb-8">
        <form @submit.prevent="generateCards" class="space-y-6">
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
              <label class="block text-sm font-medium text-gray-300 mb-2">Number of Cards</label>
              <input
                v-model.number="cardCount"
                type="number"
                min="1"
                max="50"
                required
                class="input-field"
                placeholder="5"
              />
            </div>
            
            <div class="flex items-end">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  v-model="generatePdf"
                  type="checkbox"
                  class="w-5 h-5 text-space-blue bg-space-darker border-space-blue/30 rounded"
                />
                <span class="text-gray-300">Generate PDF</span>
              </label>
            </div>
          </div>
          
          <button type="submit" :disabled="loading" class="btn-primary w-full">
            {{ loading ? 'Generating...' : 'Generate Study Cards' }}
          </button>
        </form>
      </div>
      
      <!-- Error Message -->
      <div v-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg mb-8">
        {{ error }}
      </div>
      
      <!-- Cards Display -->
      <div v-if="studyData" class="results-section">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-semibold text-white mb-2">{{ studyData.title }}</h2>
          <p class="text-gray-400">{{ studyData.cards.length }} study cards generated</p>
          
          <div v-if="studyData.pdfUrl" class="mt-4">
            <a
              :href="`${apiBaseUrl}${studyData.pdfUrl}`"
              target="_blank"
              class="btn-download"
            >
              📥 Download PDF
            </a>
          </div>
        </div>
        
        <div class="cards-grid">
          <div
            v-for="(card, index) in studyData.cards"
            :key="index"
            class="study-card"
            @click="flipCard(index)"
            :class="{ flipped: flippedCards[index] }"
          >
            <div class="card-inner">
              <div class="card-front">
                <div class="card-label">Question {{ index + 1 }}</div>
                <p class="card-text">{{ card.question }}</p>
                <p class="card-hint">Click to reveal answer</p>
              </div>
              <div class="card-back">
                <div class="card-label">Answer</div>
                <p class="card-text">{{ card.answer }}</p>
                <p class="card-hint">Click to show question</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/api/axios'
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api'

const route = useRoute()
const apiBaseUrl = API_BASE_URL

const publicationId = ref('')
const cardCount = ref(5)
const generatePdf = ref(false)

const studyData = ref<any>(null)
const flippedCards = reactive<Record<number, boolean>>({})
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (route.params.id) {
    publicationId.value = route.params.id as string
  }
})

async function generateCards() {
  loading.value = true
  error.value = ''
  studyData.value = null
  Object.keys(flippedCards).forEach(key => delete flippedCards[+key])
  
  try {
    const params = {
      count: cardCount.value,
      pdf: generatePdf.value
    }
    
    const response = await apiClient.get(
      API_ENDPOINTS.CARDS(publicationId.value),
      { params }
    )
    
    studyData.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to generate study cards.'
  } finally {
    loading.value = false
  }
}

function flipCard(index: number) {
  flippedCards[index] = !flippedCards[index]
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

.btn-download {
  @apply inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors;
}

.cards-grid {
  @apply grid md:grid-cols-2 gap-6;
}

.study-card {
  @apply h-64 cursor-pointer perspective-1000;
}

.card-inner {
  @apply relative w-full h-full transition-transform duration-500 transform-style-3d;
}

.study-card.flipped .card-inner {
  @apply rotate-y-180;
}

.card-front,
.card-back {
  @apply absolute w-full h-full backface-hidden bg-space-dark border border-space-blue/30 rounded-xl p-6 flex flex-col justify-center items-center text-center;
}

.card-back {
  @apply rotate-y-180;
}

.card-label {
  @apply text-sm text-space-blue font-semibold mb-4 uppercase;
}

.card-text {
  @apply text-white text-lg mb-4;
}

.card-hint {
  @apply text-gray-500 text-sm;
}

/* Tailwind doesn't have these by default */
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>

