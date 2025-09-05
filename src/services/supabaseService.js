// Supabase Service for PocketLegal
// Handles all database operations including user management, encounters, and legal content

import { createClient } from '@supabase/supabase-js'
import { config } from '../config/api.js'

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.anonKey)

// User Management Functions
export const userService = {
  // Create or update user profile
  async upsertUser(userData) {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.users)
        .upsert({
          user_id: userData.userId,
          email: userData.email,
          subscription_status: userData.subscriptionStatus || 'free',
          preferred_language: userData.preferredLanguage || 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error upserting user:', error)
      return { success: false, error: error.message }
    }
  },

  // Get user by ID
  async getUser(userId) {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.users)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error getting user:', error)
      return { success: false, error: error.message }
    }
  },

  // Update user subscription status
  async updateSubscription(userId, subscriptionStatus) {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.users)
        .update({ 
          subscription_status: subscriptionStatus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating subscription:', error)
      return { success: false, error: error.message }
    }
  }
}

// Encounter Management Functions
export const encounterService = {
  // Create new encounter
  async createEncounter(encounterData) {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.encounters)
        .insert({
          encounter_id: encounterData.encounterId,
          user_id: encounterData.userId,
          timestamp: encounterData.timestamp,
          location: encounterData.location,
          encounter_type: encounterData.type,
          notes: encounterData.notes,
          recording_url: encounterData.recordingUrl,
          created_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating encounter:', error)
      return { success: false, error: error.message }
    }
  },

  // Get encounters for a user
  async getUserEncounters(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.encounters)
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error getting encounters:', error)
      return { success: false, error: error.message }
    }
  },

  // Update encounter
  async updateEncounter(encounterId, updates) {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.encounters)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('encounter_id', encounterId)
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating encounter:', error)
      return { success: false, error: error.message }
    }
  },

  // Delete encounter
  async deleteEncounter(encounterId) {
    try {
      const { error } = await supabase
        .from(config.supabase.tables.encounters)
        .delete()
        .eq('encounter_id', encounterId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting encounter:', error)
      return { success: false, error: error.message }
    }
  }
}

// Legal Content Management Functions
export const legalContentService = {
  // Get legal content by state and scenario
  async getLegalContent(state, scenario, language = 'en') {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.legalContent)
        .select('*')
        .eq('state', state)
        .eq('scenario', scenario)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error getting legal content:', error)
      return { success: false, error: error.message }
    }
  },

  // Create or update legal content
  async upsertLegalContent(contentData) {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.legalContent)
        .upsert({
          content_id: contentData.contentId,
          state: contentData.state,
          scenario: contentData.scenario,
          script_en: contentData.scriptEn,
          script_es: contentData.scriptEs,
          legal_summary: contentData.legalSummary,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error upserting legal content:', error)
      return { success: false, error: error.message }
    }
  },

  // Get all legal content for a state
  async getStateContent(state) {
    try {
      const { data, error } = await supabase
        .from(config.supabase.tables.legalContent)
        .select('*')
        .eq('state', state)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error getting state content:', error)
      return { success: false, error: error.message }
    }
  }
}

// Database Schema Creation (for development setup)
export const createTables = async () => {
  try {
    // Users table
    await supabase.rpc('create_users_table', {})
    
    // Encounters table
    await supabase.rpc('create_encounters_table', {})
    
    // Legal content table
    await supabase.rpc('create_legal_content_table', {})
    
    console.log('Database tables created successfully')
    return { success: true }
  } catch (error) {
    console.error('Error creating tables:', error)
    return { success: false, error: error.message }
  }
}

// Export the Supabase client for direct use if needed
export { supabase }
export default supabase
