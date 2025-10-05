<template>
  <div class="stats-view container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold text-white mb-8 text-center">Statistics Dashboard</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-space-blue"></div>
      <p class="text-gray-400 mt-4">Loading statistics...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg">
      {{ error }}
    </div>
    
    <!-- Stats Display -->
    <div v-else-if="stats" class="space-y-8">
      <!-- Summary Cards -->
      <div class="grid md:grid-cols-3 gap-6">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-value">{{ stats.totalPublications || 0 }}</div>
          <div class="stat-label">Total Publications</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-value">{{ yearRange }}</div>
          <div class="stat-label">Year Range</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔤</div>
          <div class="stat-value">{{ stats.topWords?.length || 0 }}</div>
          <div class="stat-label">Trending Keywords</div>
        </div>
      </div>
      
      <!-- Charts -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Year Distribution Chart -->
        <div class="chart-card">
          <h2 class="chart-title">Publications by Year</h2>
          <canvas ref="yearChartRef"></canvas>
        </div>
        
        <!-- Top Words Chart -->
        <div class="chart-card">
          <h2 class="chart-title">Top Keywords</h2>
          <canvas ref="wordsChartRef"></canvas>
        </div>
      </div>
      
      <!-- Top Words Table -->
      <div class="table-card">
        <h2 class="chart-title">Most Frequent Keywords</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-space-blue/30">
                <th class="text-left py-3 px-4 text-gray-400">Rank</th>
                <th class="text-left py-3 px-4 text-gray-400">Keyword</th>
                <th class="text-right py-3 px-4 text-gray-400">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(word, index) in stats.topWords"
                :key="word.word"
                class="border-b border-space-blue/10 hover:bg-space-blue/10 transition-colors"
              >
                <td class="py-3 px-4 text-gray-300">{{ index + 1 }}</td>
                <td class="py-3 px-4 text-white font-medium">{{ word.word }}</td>
                <td class="py-3 px-4 text-right text-space-blue font-semibold">{{ word.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import apiClient from '@/api/axios'
import { API_ENDPOINTS } from '@/config/api'

Chart.register(...registerables)

const stats = ref<any>(null)
const loading = ref(false)
const error = ref('')

const yearChartRef = ref<HTMLCanvasElement | null>(null)
const wordsChartRef = ref<HTMLCanvasElement | null>(null)

const yearRange = computed(() => {
  if (!stats.value?.yearCounts) return 'N/A'
  const years = Object.keys(stats.value.yearCounts).map(Number).filter(y => !isNaN(y))
  if (years.length === 0) return 'N/A'
  return `${Math.min(...years)} - ${Math.max(...years)}`
})

onMounted(async () => {
  await fetchStats()
})

async function fetchStats() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiClient.get(API_ENDPOINTS.STATS)
    stats.value = response.data
    
    // Wait for next tick to ensure canvas elements are rendered
    await new Promise(resolve => setTimeout(resolve, 100))
    
    renderCharts()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load statistics.'
  } finally {
    loading.value = false
  }
}

function renderCharts() {
  if (!stats.value) return
  
  // Year Distribution Chart
  if (yearChartRef.value && stats.value.yearCounts) {
    const years = Object.keys(stats.value.yearCounts).sort()
    const counts = years.map(year => stats.value.yearCounts[year])
    
    new Chart(yearChartRef.value, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [{
          label: 'Publications',
          data: counts,
          backgroundColor: 'rgba(10, 129, 209, 0.8)',
          borderColor: 'rgba(10, 129, 209, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#9CA3AF' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(10, 129, 209, 0.1)' }
          },
          x: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(10, 129, 209, 0.1)' }
          }
        }
      }
    })
  }
  
  // Top Words Chart
  if (wordsChartRef.value && stats.value.topWords) {
    const topWords = stats.value.topWords.slice(0, 10)
    const labels = topWords.map((w: any) => w.word)
    const counts = topWords.map((w: any) => w.count)
    
    new Chart(wordsChartRef.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: [
            '#0A81D1',
            '#0033A0',
            '#1E90FF',
            '#4169E1',
            '#6495ED',
            '#00BFFF',
            '#87CEEB',
            '#4682B4',
            '#5F9EA0',
            '#1E3A8A'
          ],
          borderWidth: 2,
          borderColor: '#0a0e27'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#9CA3AF' }
          }
        }
      }
    })
  }
}
</script>

<style scoped>
.stat-card {
  @apply bg-space-dark p-6 rounded-xl border border-space-blue/30 text-center;
}

.stat-icon {
  @apply text-4xl mb-3;
}

.stat-value {
  @apply text-3xl font-bold text-white mb-2;
}

.stat-label {
  @apply text-gray-400 text-sm;
}

.chart-card {
  @apply bg-space-dark p-6 rounded-xl border border-space-blue/30;
}

.chart-title {
  @apply text-xl font-semibold text-white mb-4;
}

.table-card {
  @apply bg-space-dark p-6 rounded-xl border border-space-blue/30;
}
</style>

