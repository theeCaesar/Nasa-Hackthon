export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://nasa-hackthon-backend.onrender.com"

export const API_ENDPOINTS = {
  // Auth
  SIGNUP: '/api/v1/auth/signup',
  LOGIN: '/api/v1/auth/login',
  
  // Search
  SEARCH: '/api/v1/search',
  
  // Summarize
  SUMMARIZE: '/api/v1/summarize',
  SUMMARIZE_BY_ID: (id: string) => `/api/v1/summarize/${id}`,
  
  // Chat
  CHAT: '/api/v1/chat',
  
  // Study Cards
  CARDS: (id: string) => `/api/v1/cards/${id}`,
  
  // Statistics
  STATS: '/api/v1/analysis/stats',
  
  // User Resources
  RESOURCES: '/api/v1/users/resources',
  RESOURCE_BY_ID: (id: string) => `/api/v1/users/resources/${id}`,
  
  // Contact
  CONTACT: '/api/v1/contact',
}

