// OpenAI Service for PocketLegal
// Handles AI-powered legal script generation and content creation

import OpenAI from 'openai'
import { config } from '../config/api.js'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
})

// Legal Script Generation Service
export const legalScriptService = {
  // Generate contextual legal scripts for specific scenarios
  async generateScripts(scenario, state, language = 'en', userContext = {}) {
    try {
      const prompt = this.buildScriptPrompt(scenario, state, language, userContext)
      
      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a legal expert specializing in civil rights and police interactions. Provide accurate, actionable legal scripts that protect citizens\' rights while promoting safety and de-escalation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.openai.maxTokens,
        temperature: 0.3 // Lower temperature for more consistent legal advice
      })

      const response = completion.choices[0].message.content
      return this.parseScriptResponse(response, language)
    } catch (error) {
      console.error('Error generating legal scripts:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackScripts(scenario, language)
      }
    }
  },

  // Build prompt for script generation
  buildScriptPrompt(scenario, state, language, userContext) {
    const languageName = language === 'es' ? 'Spanish' : 'English'
    
    return `Generate legal scripts for a ${scenario} scenario in ${state} state.

Requirements:
- Language: ${languageName}
- Provide 4-6 specific phrases/scripts
- Include brief guidance on when to use each script
- Focus on constitutional rights (4th, 5th, 6th amendments)
- Emphasize de-escalation and safety
- Be concise and memorable
- Include state-specific considerations for ${state}

Context: ${JSON.stringify(userContext)}

Format the response as JSON with this structure:
{
  "scripts": [
    {
      "text": "Script text here",
      "usage": "When to use this script",
      "priority": "high|medium|low"
    }
  ],
  "guidance": "General guidance for this scenario",
  "stateSpecific": "State-specific legal considerations"
}`
  },

  // Parse OpenAI response into structured format
  parseScriptResponse(response, language) {
    try {
      const parsed = JSON.parse(response)
      return {
        success: true,
        data: {
          scripts: parsed.scripts || [],
          guidance: parsed.guidance || '',
          stateSpecific: parsed.stateSpecific || '',
          language: language,
          generated: true,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      // If JSON parsing fails, try to extract scripts from plain text
      return this.extractScriptsFromText(response, language)
    }
  },

  // Extract scripts from plain text response
  extractScriptsFromText(text, language) {
    const lines = text.split('\n').filter(line => line.trim())
    const scripts = []
    
    lines.forEach(line => {
      if (line.includes('"') || line.includes('•') || line.includes('-')) {
        const cleanText = line.replace(/[•\-"]/g, '').trim()
        if (cleanText.length > 10) {
          scripts.push({
            text: cleanText,
            usage: 'Use when appropriate for the situation',
            priority: 'medium'
          })
        }
      }
    })

    return {
      success: true,
      data: {
        scripts: scripts.slice(0, 6), // Limit to 6 scripts
        guidance: 'AI-generated legal scripts. Always consult with a lawyer for specific legal advice.',
        stateSpecific: 'State-specific information may vary.',
        language: language,
        generated: true,
        timestamp: new Date().toISOString()
      }
    }
  },

  // Fallback scripts when AI generation fails
  getFallbackScripts(scenario, language) {
    const fallbackData = {
      'traffic-stop': {
        en: [
          { text: "I am exercising my right to remain silent.", usage: "Always safe to use", priority: "high" },
          { text: "I do not consent to any searches.", usage: "When asked about searches", priority: "high" },
          { text: "Am I free to leave?", usage: "To clarify your status", priority: "medium" },
          { text: "I would like to speak to my attorney.", usage: "If detained or arrested", priority: "high" }
        ],
        es: [
          { text: "Estoy ejerciendo mi derecho a permanecer en silencio.", usage: "Siempre seguro de usar", priority: "high" },
          { text: "No doy mi consentimiento para ningún registro.", usage: "Cuando pregunten sobre registros", priority: "high" },
          { text: "¿Soy libre de irme?", usage: "Para aclarar su estado", priority: "medium" },
          { text: "Me gustaría hablar con mi abogado.", usage: "Si es detenido o arrestado", priority: "high" }
        ]
      }
    }

    const scripts = fallbackData[scenario]?.[language] || fallbackData['traffic-stop'][language]
    
    return {
      scripts,
      guidance: language === 'es' 
        ? 'Manténgase calmado y cooperativo mientras ejerce sus derechos.'
        : 'Remain calm and cooperative while exercising your rights.',
      stateSpecific: language === 'es'
        ? 'Las leyes pueden variar según el estado.'
        : 'Laws may vary by state.',
      language,
      generated: false,
      timestamp: new Date().toISOString()
    }
  }
}

// Legal Summary Generation Service
export const legalSummaryService = {
  // Generate legal summaries for specific locations and scenarios
  async generateSummary(location, scenario, language = 'en') {
    try {
      const prompt = `Generate a concise legal summary for ${scenario} encounters in ${location}.

Include:
- Key rights citizens should know
- Common legal issues
- State/local specific laws
- Do's and don'ts
- When to contact a lawyer

Language: ${language === 'es' ? 'Spanish' : 'English'}
Keep it under 300 words and actionable.`

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a legal expert providing citizen education on civil rights and police interactions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      })

      return {
        success: true,
        data: {
          summary: completion.choices[0].message.content,
          location,
          scenario,
          language,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error generating legal summary:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Content Translation Service
export const translationService = {
  // Translate legal content between English and Spanish
  async translateContent(text, targetLanguage) {
    try {
      const prompt = `Translate the following legal text to ${targetLanguage === 'es' ? 'Spanish' : 'English'}. 
      Maintain legal accuracy and formal tone:

      "${text}"`

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional legal translator specializing in civil rights and police interaction terminology.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      })

      return {
        success: true,
        data: {
          originalText: text,
          translatedText: completion.choices[0].message.content,
          targetLanguage,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error translating content:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Export all services
export default {
  legalScriptService,
  legalSummaryService,
  translationService
}
