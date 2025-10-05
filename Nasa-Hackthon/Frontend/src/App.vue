<template>
  <div id="app" class="min-h-screen app-container">
    <nav class="nav-container">
      <!-- Animated Stars Background -->
      <div class="stars-container">
        <div class="stars"></div>
        <div class="stars2"></div>
        <div class="stars3"></div>
      </div>
      
      <!-- Animated Gradient Overlay -->
      <div class="gradient-overlay"></div>
      
      <div class="container mx-auto px-4 py-3 relative z-10">
        <div class="flex items-center justify-between">
          <router-link to="/" class="logo-container">
            <div class="rocket-icon">🚀</div>
            <span class="logo-text">TerraPaper</span>
            <div class="logo-glow"></div>
          </router-link>
          
          <div class="hidden md:flex space-x-6 items-center">
            <router-link to="/" class="nav-link">
              <span class="nav-link-text">Home</span>
              <span class="nav-link-glow"></span>
            </router-link>
            <router-link to="/search" class="nav-link">
              <span class="nav-link-text">Search</span>
              <span class="nav-link-glow"></span>
            </router-link>
            <router-link to="/chat" class="nav-link">
              <span class="nav-link-text">AI Assistant</span>
              <span class="nav-link-glow"></span>
            </router-link>
            <router-link to="/stats" class="nav-link">
              <span class="nav-link-text">Statistics</span>
              <span class="nav-link-glow"></span>
            </router-link>
            <router-link v-if="authStore.isAuthenticated" to="/resources" class="nav-link">
              <span class="nav-link-text">My Resources</span>
              <span class="nav-link-glow"></span>
            </router-link>
            <router-link to="/contact" class="nav-link">
              <span class="nav-link-text">Contact</span>
              <span class="nav-link-glow"></span>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-4">
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="btn-secondary">Login</router-link>
              <router-link to="/signup" class="btn-primary">Sign Up</router-link>
            </template>
            <template v-else>
              <span class="text-sm text-gray-300">{{ authStore.user?.username || 'User' }}</span>
              <button @click="handleLogout" class="btn-secondary">Logout</button>
            </template>
          </div>
        </div>
        
        <!-- Mobile menu button -->
        <div class="md:hidden mt-4">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="md:hidden mt-4 space-y-2">
          <router-link to="/" class="block nav-link" @click="mobileMenuOpen = false">Home</router-link>
          <router-link to="/search" class="block nav-link" @click="mobileMenuOpen = false">Search</router-link>
          <router-link to="/chat" class="block nav-link" @click="mobileMenuOpen = false">AI Assistant</router-link>
          <router-link to="/stats" class="block nav-link" @click="mobileMenuOpen = false">Statistics</router-link>
          <router-link v-if="authStore.isAuthenticated" to="/resources" class="block nav-link" @click="mobileMenuOpen = false">My Resources</router-link>
          <router-link to="/contact" class="block nav-link" @click="mobileMenuOpen = false">Contact</router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <footer class="bg-space-darker border-t border-space-blue/30 mt-20">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center text-gray-400 text-sm">
          <p>NASA Space Apps Challenge 2025 - TerraPaper Knowledge Engine</p>
          <p class="mt-2">Built with ❤️ for the Community</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

function handleLogout() {
  authStore.clearAuth()
  router.push('/')
}
</script>

<style scoped>
/* Navbar Container with Space Theme */
.nav-container {
  @apply border-b border-space-blue/30 sticky top-0 z-50 backdrop-blur-md;
  position: relative;
  background: linear-gradient(135deg, rgba(5, 8, 18, 0.95) 0%, rgba(10, 14, 39, 0.95) 100%);
  overflow: hidden;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* Animated Stars Background */
.stars-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stars {
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow: 780px 10px #FFF, 1240px 30px #FFF, 50px 70px #FFF, 400px 20px #FFF,
    1200px 50px #FFF, 900px 90px #FFF, 1500px 15px #FFF, 300px 45px #FFF,
    600px 80px #FFF, 1100px 35px #FFF, 200px 60px #FFF, 1400px 85px #FFF;
  animation: animStar 150s linear infinite;
}

.stars2 {
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow: 880px 15px #0A81D1, 340px 35px #0A81D1, 150px 75px #0A81D1,
    500px 25px #0A81D1, 1300px 55px #0A81D1, 800px 95px #0A81D1,
    1600px 20px #0A81D1, 400px 50px #0A81D1;
  animation: animStar 100s linear infinite;
}

.stars3 {
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow: 980px 5px rgba(255, 255, 255, 0.5), 440px 40px rgba(255, 255, 255, 0.5),
    250px 65px rgba(255, 255, 255, 0.5), 700px 30px rgba(255, 255, 255, 0.5),
    1500px 60px rgba(255, 255, 255, 0.5), 1000px 85px rgba(255, 255, 255, 0.5);
  animation: animStar 200s linear infinite;
}

@keyframes animStar {
  0% {
    transform: translateX(0) translateY(0);
  }
  100% {
    transform: translateX(-200px) translateY(-100px);
  }
}

/* Animated Gradient Overlay */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(10, 129, 209, 0.1) 50%, 
    transparent 100%);
  animation: slideGradient 8s ease-in-out infinite;
}

@keyframes slideGradient {
  0%, 100% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    transform: translateX(100%);
    opacity: 1;
  }
}

/* Logo Animations */
.logo-container {
  @apply flex items-center space-x-2 relative;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

.rocket-icon {
  @apply text-2xl font-bold;
  display: inline-block;
  animation: rocketFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(10, 129, 209, 0.6));
}

@keyframes rocketFloat {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.logo-text {
  @apply text-xl font-semibold text-white relative;
  text-shadow: 0 0 20px rgba(10, 129, 209, 0.5);
}

.logo-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(10, 129, 209, 0.3) 0%, transparent 70%);
  animation: pulseGlow 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Nav Links with Glow Effect */
.nav-link {
  @apply text-gray-300 transition-all duration-300 relative;
  position: relative;
  padding: 0.5rem 0;
}

.nav-link-text {
  position: relative;
  z-index: 2;
}

.nav-link-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #0A81D1, transparent);
  transition: width 0.4s ease;
  box-shadow: 0 0 10px #0A81D1;
}

.nav-link:hover {
  color: #0A81D1;
  text-shadow: 0 0 10px rgba(10, 129, 209, 0.5);
}

.nav-link:hover .nav-link-glow {
  width: 100%;
}

.router-link-active {
  color: #0A81D1 !important;
  text-shadow: 0 0 10px rgba(10, 129, 209, 0.8);
}

.router-link-active .nav-link-glow {
  width: 100%;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Buttons with Space Theme */
.btn-primary {
  @apply bg-space-blue text-white px-4 py-2 rounded-lg font-medium relative overflow-hidden;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(10, 129, 209, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 25px rgba(10, 129, 209, 0.6);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-primary:hover::before {
  width: 300px;
  height: 300px;
}

.btn-secondary {
  @apply bg-transparent border border-space-blue text-space-blue px-4 py-2 rounded-lg font-medium relative overflow-hidden;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  @apply bg-space-blue text-white;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(10, 129, 209, 0.4);
}

/* App Container - Remove all gaps */
.app-container {
  margin: 0 !important;
  padding: 0 !important;
  display: block;
}

/* Main Content - Remove any gaps */
.main-content {
  margin: 0 !important;
  padding: 0 !important;
  margin-top: 0 !important;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
