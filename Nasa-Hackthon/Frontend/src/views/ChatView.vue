<template>
  <div class="chat-view container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">AI Chat Assistant</h1>
        <p class="text-gray-400">Ask questions about space biology research</p>
      </div>
      
      <!-- Chat Messages -->
      <div class="chat-container">
        <div class="messages-area" ref="messagesArea">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="text-6xl mb-4">💬</div>
            <p class="text-gray-400">Start a conversation by asking a question below</p>
          </div>
          
          <div v-for="(message, index) in messages" :key="index" class="message-wrapper">
            <div :class="['message', message.role]">
              <div class="message-header">
                <span class="font-semibold">{{ message.role === 'user' ? 'You' : 'AI Assistant' }}</span>
              </div>
              <div class="message-content">{{ message.content }}</div>
            </div>
            
            <!-- Show sources for assistant messages -->
            <div v-if="message.role === 'assistant' && message.sources && message.sources.length > 0" class="sources mt-3">
              <p class="text-sm text-gray-400 mb-2">Sources:</p>
              <div class="space-y-1">
                <a
                  v-for="source in message.sources"
                  :key="source.id"
                  :href="source.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="source-link"
                >
                  {{ source.title }} ↗
                </a>
              </div>
            </div>
          </div>
          
          <div v-if="loading" class="message assistant">
            <div class="message-header">
              <span class="font-semibold">AI Assistant</span>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Input Area -->
        <div class="input-area">
          <form @submit.prevent="sendMessage" class="flex gap-3">
            <input
              v-model="currentMessage"
              type="text"
              placeholder="Ask a question..."
              class="input-field flex-1"
              :disabled="loading"
            />
            <button type="submit" :disabled="loading || !currentMessage.trim()" class="btn-send">
              {{ loading ? '...' : 'Send' }}
            </button>
          </form>
          
          <button v-if="messages.length > 0" @click="clearChat" class="btn-clear mt-3">
            Clear Chat
          </button>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg mt-6">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import apiClient from '@/api/axios'
import { API_ENDPOINTS } from '@/config/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: any[]
}

const messages = ref<Message[]>([])
const currentMessage = ref('')
const loading = ref(false)
const error = ref('')
const messagesArea = ref<HTMLElement | null>(null)

async function sendMessage() {
  if (!currentMessage.value.trim() || loading.value) return
  
  const userMessage = currentMessage.value
  messages.value.push({ role: 'user', content: userMessage })
  currentMessage.value = ''
  
  loading.value = true
  error.value = ''
  
  await nextTick()
  scrollToBottom()
  
  try {
    const payload = {
      messages: messages.value.map(m => ({ role: m.role, content: m.content })),
      top_k: 2
    }
    
    const response = await apiClient.post(API_ENDPOINTS.CHAT, payload)
    
    messages.value.push({
      role: 'assistant',
      content: response.data.response,
      sources: response.data.sources || []
    })
    
    await nextTick()
    scrollToBottom()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to get response from assistant.'
  } finally {
    loading.value = false
  }
}

function clearChat() {
  messages.value = []
  error.value = ''
}

function scrollToBottom() {
  if (messagesArea.value) {
    messagesArea.value.scrollTop = messagesArea.value.scrollHeight
  }
}
</script>

<style scoped>
.chat-container {
  @apply bg-space-dark rounded-xl border border-space-blue/30 overflow-hidden;
}

.messages-area {
  @apply p-6 h-[500px] overflow-y-auto space-y-4;
}

.empty-state {
  @apply flex flex-col items-center justify-center h-full text-center;
}

.message-wrapper {
  @apply mb-4;
}

.message {
  @apply p-4 rounded-lg max-w-[80%];
}

.message.user {
  @apply bg-space-blue ml-auto;
}

.message.assistant {
  @apply bg-space-navy mr-auto;
}

.message-header {
  @apply text-sm text-gray-400 mb-2;
}

.message-content {
  @apply text-white whitespace-pre-line;
}

.sources {
  @apply ml-4 pl-4 border-l-2 border-space-blue/30;
}

.source-link {
  @apply block text-sm text-space-blue hover:underline;
}

.typing-indicator {
  @apply flex space-x-2;
}

.typing-indicator span {
  @apply w-2 h-2 bg-gray-400 rounded-full animate-pulse;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.input-area {
  @apply p-4 bg-space-darker border-t border-space-blue/30;
}

.input-field {
  @apply w-full px-4 py-3 bg-space-dark border border-space-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-space-blue transition-colors;
}

.btn-send {
  @apply bg-space-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-clear {
  @apply text-sm text-gray-400 hover:text-white transition-colors;
}
</style>

