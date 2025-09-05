// API Configuration for PocketLegal
// This file centralizes all API configurations and provides environment-based settings

export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    maxTokens: 1000
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    tables: {
      users: 'users',
      encounters: 'encounters',
      legalContent: 'legal_content'
    }
  },

  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    priceId: 'price_1234567890', // Replace with actual Stripe price ID
    successUrl: `${window.location.origin}/subscription/success`,
    cancelUrl: `${window.location.origin}/subscription/cancel`
  },

  // Pinata IPFS Configuration
  pinata: {
    apiKey: import.meta.env.VITE_PINATA_API_KEY,
    secretApiKey: import.meta.env.VITE_PINATA_SECRET_API_KEY,
    baseURL: 'https://api.pinata.cloud',
    gateway: 'https://gateway.pinata.cloud/ipfs'
  },

  // Airstack Configuration
  airstack: {
    apiKey: import.meta.env.VITE_AIRSTACK_API_KEY,
    baseURL: 'https://api.airstack.xyz/gql',
    endpoint: '/graphql'
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'PocketLegal',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development'
  },

  // Legal Content Configuration
  legal: {
    defaultState: 'CA', // Default to California
    supportedLanguages: ['en', 'es'],
    scenarios: [
      'traffic-stop',
      'questioning',
      'search-consent',
      'arrest',
      'detention',
      'home-visit'
    ]
  }
}

// Validation function to check if all required environment variables are set
export const validateConfig = () => {
  const requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_PINATA_API_KEY',
    'VITE_PINATA_SECRET_API_KEY',
    'VITE_AIRSTACK_API_KEY'
  ]

  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
    return false
  }
  
  return true
}

// Helper function to get API headers with authentication
export const getAuthHeaders = (service) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  switch (service) {
    case 'openai':
      headers['Authorization'] = `Bearer ${config.openai.apiKey}`
      break
    case 'pinata':
      headers['pinata_api_key'] = config.pinata.apiKey
      headers['pinata_secret_api_key'] = config.pinata.secretApiKey
      break
    case 'airstack':
      headers['Authorization'] = `Bearer ${config.airstack.apiKey}`
      break
    default:
      break
  }

  return headers
}

export default config
