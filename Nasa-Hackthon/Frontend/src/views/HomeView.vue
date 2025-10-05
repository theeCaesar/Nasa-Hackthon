<template>
  <div class="home-view">
    <!-- Hero Section -->
    <HeroSection class="hero-no-gap" />
    
    <!-- Features Section -->
    <section class="py-20 container mx-auto px-4">
      <h2 class="text-4xl font-bold text-center mb-16 text-white">Features</h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="feature-card" v-for="feature in features" :key="feature.title">
          <div class="text-4xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-2xl font-semibold mb-3 text-white">{{ feature.title }}</h3>
          <p class="text-gray-400">{{ feature.description }}</p>
          <router-link :to="feature.link" class="inline-block mt-4 text-space-blue hover:text-space-blue/80 transition-colors">
            Learn more →
          </router-link>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-space-navy to-space-blue">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-6 text-white">Ready to Explore?</h2>
        <p class="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Join thousands of researchers discovering insights from NASA's space biology publications
        </p>
        <router-link v-if="!authStore.isAuthenticated" to="/signup" class="hero-btn">
          Get Started Free
        </router-link>
        <router-link v-else to="/search" class="hero-btn">
          Start Searching
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import HeroSection from '@/components/HeroSection.vue'

const authStore = useAuthStore()

const features = [
  {
    icon: '🔍',
    title: 'Semantic Search',
    description: 'Find relevant publications using AI-powered vector search with advanced filtering by year and ownership.',
    link: '/search'
  },
  {
    icon: '📝',
    title: 'AI Summaries',
    description: 'Get expert or student-friendly summaries of complex research papers in seconds.',
    link: '/summary'
  },
  {
    icon: '💬',
    title: 'Chat Assistant',
    description: 'Ask questions and get contextual answers from the knowledge base through natural conversation.',
    link: '/chat'
  },
  {
    icon: '🎓',
    title: 'Study Cards',
    description: 'Generate flashcards and Q&A pairs from any publication to enhance your learning.',
    link: '/study-cards'
  },
  {
    icon: '📊',
    title: 'Statistics',
    description: 'Visualize publication trends, year distributions, and frequently discussed topics.',
    link: '/stats'
  },
  {
    icon: '📚',
    title: 'My Resources',
    description: 'Add and manage your own research resources with full AI capabilities.',
    link: '/resources'
  }
]
</script>

<style scoped>
.home-view {
  margin: 0;
  padding: 0;
}

.hero-no-gap {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.feature-card {
  @apply bg-space-dark p-8 rounded-xl border border-space-blue/30 hover:border-space-blue transition-all duration-300 hover:transform hover:scale-105;
}
</style>

