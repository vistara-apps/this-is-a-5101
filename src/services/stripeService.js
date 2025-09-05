// Stripe Service for PocketLegal
// Handles subscription payments and billing management

import { loadStripe } from '@stripe/stripe-js'
import { config } from '../config/api.js'

// Initialize Stripe
let stripePromise
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripe.publishableKey)
  }
  return stripePromise
}

// Subscription Management Service
export const subscriptionService = {
  // Create checkout session for premium subscription
  async createCheckoutSession(userId, userEmail) {
    try {
      // In a real implementation, this would call your backend API
      // which would create the Stripe checkout session server-side
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          priceId: config.stripe.priceId,
          successUrl: config.stripe.successUrl,
          cancelUrl: config.stripe.cancelUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id
      })

      if (error) {
        throw error
      }

      return { success: true, sessionId: session.id }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return { success: false, error: error.message }
    }
  },

  // Handle successful subscription (called from success page)
  async handleSubscriptionSuccess(sessionId) {
    try {
      // Verify the session and update user subscription status
      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        throw new Error('Failed to verify subscription')
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (error) {
      console.error('Error handling subscription success:', error)
      return { success: false, error: error.message }
    }
  },

  // Create customer portal session for subscription management
  async createPortalSession(customerId) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId })
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const session = await response.json()
      
      // Redirect to customer portal
      window.location.href = session.url
      
      return { success: true, url: session.url }
    } catch (error) {
      console.error('Error creating portal session:', error)
      return { success: false, error: error.message }
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      return { success: false, error: error.message }
    }
  }
}

// Payment Utilities
export const paymentUtils = {
  // Format price for display
  formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100) // Stripe amounts are in cents
  },

  // Get subscription status display text
  getSubscriptionStatusText(status, language = 'en') {
    const statusTexts = {
      en: {
        active: 'Active',
        canceled: 'Canceled',
        incomplete: 'Incomplete',
        incomplete_expired: 'Expired',
        past_due: 'Past Due',
        trialing: 'Trial',
        unpaid: 'Unpaid'
      },
      es: {
        active: 'Activo',
        canceled: 'Cancelado',
        incomplete: 'Incompleto',
        incomplete_expired: 'Expirado',
        past_due: 'Vencido',
        trialing: 'Prueba',
        unpaid: 'No Pagado'
      }
    }

    return statusTexts[language][status] || status
  },

  // Check if user has premium features
  hasPremiumAccess(subscriptionStatus) {
    return ['active', 'trialing'].includes(subscriptionStatus)
  },

  // Get premium features list
  getPremiumFeatures(language = 'en') {
    const features = {
      en: [
        'Unlimited legal script generation',
        'Encrypted cloud storage for recordings',
        'Advanced location-based legal information',
        'Priority customer support',
        'Family sharing (up to 5 members)',
        'Offline access to legal scripts',
        'Custom legal document templates'
      ],
      es: [
        'Generación ilimitada de guiones legales',
        'Almacenamiento cifrado en la nube para grabaciones',
        'Información legal avanzada basada en ubicación',
        'Soporte al cliente prioritario',
        'Compartir en familia (hasta 5 miembros)',
        'Acceso sin conexión a guiones legales',
        'Plantillas de documentos legales personalizadas'
      ]
    }

    return features[language] || features.en
  }
}

// Mock implementation for development (when backend is not available)
export const mockStripeService = {
  async createCheckoutSession(userId, userEmail) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful upgrade
    return {
      success: true,
      sessionId: 'mock_session_' + Date.now(),
      message: 'Mock upgrade successful - in production this would redirect to Stripe'
    }
  },

  async handleSubscriptionSuccess(sessionId) {
    return {
      success: true,
      data: {
        subscriptionId: 'mock_sub_' + Date.now(),
        status: 'active',
        customerId: 'mock_cus_' + Date.now()
      }
    }
  },

  async createPortalSession(customerId) {
    return {
      success: true,
      url: '#mock-portal',
      message: 'Mock portal - in production this would redirect to Stripe portal'
    }
  },

  async cancelSubscription(subscriptionId) {
    return {
      success: true,
      data: {
        subscriptionId,
        status: 'canceled',
        canceledAt: new Date().toISOString()
      }
    }
  }
}

// Export services
export { getStripe }
export default {
  subscriptionService,
  paymentUtils,
  mockStripeService
}
