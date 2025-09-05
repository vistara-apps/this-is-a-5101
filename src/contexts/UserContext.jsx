import { createContext, useContext, useState, useEffect } from 'react'
import { userService, encounterService } from '../services/supabaseService.js'
import { mockStripeService } from '../services/stripeService.js'
import { validateConfig } from '../config/api.js'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: 'demo-user',
    email: 'demo@pocketlegal.com',
    subscriptionStatus: 'free', // 'free' or 'premium'
    preferredLanguage: 'en',
    customerId: null,
    subscriptionId: null
  })

  const [encounters, setEncounters] = useState([
    {
      encounterId: '1',
      timestamp: new Date().toISOString(),
      location: 'Downtown, Main St',
      type: 'Traffic Stop',
      notes: 'Routine traffic stop, no issues',
      recordingUrl: null
    }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiConfigValid, setApiConfigValid] = useState(false)

  // Check API configuration on mount
  useEffect(() => {
    const isValid = validateConfig()
    setApiConfigValid(isValid)
    
    if (!isValid) {
      console.warn('Some API services may not work properly due to missing environment variables')
    }
  }, [])

  // Load user data from Supabase (if configured)
  useEffect(() => {
    if (apiConfigValid) {
      loadUserData()
    }
  }, [apiConfigValid])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Try to load user from Supabase
      const userResult = await userService.getUser(user.userId)
      if (userResult.success) {
        setUser(prev => ({
          ...prev,
          ...userResult.data,
          userId: userResult.data.user_id,
          subscriptionStatus: userResult.data.subscription_status,
          preferredLanguage: userResult.data.preferred_language
        }))
      }

      // Load user encounters
      const encountersResult = await encounterService.getUserEncounters(user.userId)
      if (encountersResult.success) {
        const formattedEncounters = encountersResult.data.map(encounter => ({
          encounterId: encounter.encounter_id,
          timestamp: encounter.timestamp,
          location: encounter.location,
          type: encounter.encounter_type,
          notes: encounter.notes,
          recordingUrl: encounter.recording_url
        }))
        setEncounters(formattedEncounters)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const addEncounter = async (encounter) => {
    try {
      const newEncounter = {
        ...encounter,
        encounterId: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userId: user.userId
      }

      // Add to local state immediately for better UX
      setEncounters(prev => [newEncounter, ...prev])

      // Save to Supabase if configured
      if (apiConfigValid) {
        const result = await encounterService.createEncounter(newEncounter)
        if (!result.success) {
          console.error('Failed to save encounter to database:', result.error)
          // Could show a toast notification here
        }
      }

      return { success: true, data: newEncounter }
    } catch (error) {
      console.error('Error adding encounter:', error)
      return { success: false, error: error.message }
    }
  }

  const updateEncounter = async (encounterId, updates) => {
    try {
      // Update local state
      setEncounters(prev => 
        prev.map(encounter => 
          encounter.encounterId === encounterId 
            ? { ...encounter, ...updates }
            : encounter
        )
      )

      // Update in Supabase if configured
      if (apiConfigValid) {
        const result = await encounterService.updateEncounter(encounterId, updates)
        if (!result.success) {
          console.error('Failed to update encounter in database:', result.error)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating encounter:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteEncounter = async (encounterId) => {
    try {
      // Remove from local state
      setEncounters(prev => prev.filter(encounter => encounter.encounterId !== encounterId))

      // Delete from Supabase if configured
      if (apiConfigValid) {
        const result = await encounterService.deleteEncounter(encounterId)
        if (!result.success) {
          console.error('Failed to delete encounter from database:', result.error)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting encounter:', error)
      return { success: false, error: error.message }
    }
  }

  const upgradeSubscription = async () => {
    try {
      setLoading(true)
      
      // Use mock service for development
      const result = await mockStripeService.createCheckoutSession(user.userId, user.email)
      
      if (result.success) {
        // Update user subscription status
        const updatedUser = {
          ...user,
          subscriptionStatus: 'premium',
          subscriptionId: result.sessionId
        }
        
        setUser(updatedUser)

        // Update in Supabase if configured
        if (apiConfigValid) {
          await userService.updateSubscription(user.userId, 'premium')
        }

        return { success: true, message: result.message || 'Subscription upgraded successfully!' }
      }

      return result
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async () => {
    try {
      setLoading(true)
      
      // Use mock service for development
      const result = await mockStripeService.cancelSubscription(user.subscriptionId)
      
      if (result.success) {
        // Update user subscription status
        const updatedUser = {
          ...user,
          subscriptionStatus: 'free',
          subscriptionId: null
        }
        
        setUser(updatedUser)

        // Update in Supabase if configured
        if (apiConfigValid) {
          await userService.updateSubscription(user.userId, 'free')
        }

        return { success: true, message: 'Subscription canceled successfully' }
      }

      return result
    } catch (error) {
      console.error('Error canceling subscription:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)

      // Update in Supabase if configured
      if (apiConfigValid) {
        const result = await userService.upsertUser(updatedUser)
        if (!result.success) {
          console.error('Failed to update user profile:', result.error)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error: error.message }
    }
  }

  const hasPremiumAccess = () => {
    return ['premium', 'active', 'trialing'].includes(user.subscriptionStatus)
  }

  const getRemainingFreeEncounters = () => {
    const freeLimit = 1
    return Math.max(0, freeLimit - encounters.length)
  }

  const canCreateEncounter = () => {
    return hasPremiumAccess() || getRemainingFreeEncounters() > 0
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser,
      encounters, 
      loading,
      error,
      apiConfigValid,
      addEncounter,
      updateEncounter,
      deleteEncounter,
      upgradeSubscription,
      cancelSubscription,
      updateUserProfile,
      hasPremiumAccess,
      getRemainingFreeEncounters,
      canCreateEncounter,
      loadUserData
    }}>
      {children}
    </UserContext.Provider>
  )
}
