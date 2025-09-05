import { useState, useEffect } from 'react'
import { Copy, Check, Play, Pause, Sparkles, RefreshCw } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useUser } from '../contexts/UserContext'
import { legalScriptService } from '../services/openaiService.js'
import { locationDetectionService } from '../services/locationService.js'
import InfoCard from './InfoCard'

const LegalScripts = () => {
  const { t, language } = useLanguage()
  const { user, hasPremiumAccess, apiConfigValid } = useUser()
  const [copiedScript, setCopiedScript] = useState(null)
  const [speaking, setSpeaking] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState('traffic-stop')
  const [aiScripts, setAiScripts] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [error, setError] = useState(null)

  // Get user location on component mount
  useEffect(() => {
    if (hasPremiumAccess() && apiConfigValid) {
      getUserLocation()
    }
  }, [hasPremiumAccess, apiConfigValid])

  const getUserLocation = async () => {
    try {
      const locationResult = await locationDetectionService.getCurrentLocation()
      if (locationResult.success) {
        setUserLocation(locationResult.data)
      }
    } catch (error) {
      console.error('Failed to get user location:', error)
    }
  }

  const generateAIScripts = async (scenario) => {
    if (!hasPremiumAccess() || !apiConfigValid) {
      setError('AI-powered script generation requires Premium subscription and API configuration.')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      const state = userLocation?.address?.stateCode || 'CA'
      const userContext = {
        location: userLocation?.address?.formattedAddress || 'Unknown',
        previousEncounters: user.encounters?.length || 0
      }

      const result = await legalScriptService.generateScripts(
        scenario,
        state,
        language,
        userContext
      )

      if (result.success) {
        setAiScripts(result.data)
      } else {
        setError('Failed to generate AI scripts: ' + result.error)
        // Use fallback scripts
        if (result.fallback) {
          setAiScripts(result.fallback)
        }
      }
    } catch (error) {
      console.error('Error generating AI scripts:', error)
      setError('Failed to generate AI scripts: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const scenarios = [
    {
      id: 'traffic-stop',
      title: language === 'en' ? 'Traffic Stop' : 'Control de Tráfico',
      scripts: {
        en: [
          "I am exercising my right to remain silent.",
          "I do not consent to any searches.",
          "Am I free to leave?",
          "I would like to speak to my attorney."
        ],
        es: [
          "Estoy ejerciendo mi derecho a permanecer en silencio.",
          "No doy mi consentimiento para ningún registro.",
          "¿Soy libre de irme?",
          "Me gustaría hablar con mi abogado."
        ]
      },
      guidance: {
        en: "Remain calm, keep hands visible, provide license and registration when asked.",
        es: "Manténgase calmado, mantenga las manos visibles, proporcione licencia y registro cuando se lo pidan."
      }
    },
    {
      id: 'questioning',
      title: language === 'en' ? 'Police Questioning' : 'Interrogatorio Policial',
      scripts: {
        en: [
          "I am invoking my Fifth Amendment right to remain silent.",
          "I want to speak to a lawyer before answering any questions.",
          "I do not consent to any searches of my person or property.",
          "Am I under arrest or am I free to go?"
        ],
        es: [
          "Estoy invocando mi derecho de la Quinta Enmienda a permanecer en silencio.",
          "Quiero hablar con un abogado antes de responder cualquier pregunta.",
          "No consiento ningún registro de mi persona o propiedad.",
          "¿Estoy bajo arresto o soy libre de irme?"
        ]
      },
      guidance: {
        en: "You have the right to remain silent. Use it. Ask if you're free to leave.",
        es: "Tienes derecho a permanecer en silencio. Úsalo. Pregunta si eres libre de irte."
      }
    },
    {
      id: 'search-warrant',
      title: language === 'en' ? 'Search Warrant' : 'Orden de Registro',
      scripts: {
        en: [
          "I do not consent to this search.",
          "May I see the warrant?",
          "I am invoking my right to remain silent.",
          "I want my lawyer present."
        ],
        es: [
          "No consiento este registro.",
          "¿Puedo ver la orden?",
          "Estoy invocando mi derecho a permanecer en silencio.",
          "Quiero que mi abogado esté presente."
        ]
      },
      guidance: {
        en: "Do not physically resist. State clearly that you do not consent. Ask to see the warrant.",
        es: "No resista físicamente. Declare claramente que no consiente. Pida ver la orden."
      }
    }
  ]

  const copyScript = async (script, id) => {
    try {
      await navigator.clipboard.writeText(script)
      setCopiedScript(id)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const speakScript = (script, id) => {
    if (speaking === id) {
      speechSynthesis.cancel()
      setSpeaking(null)
      return
    }

    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.lang = language === 'en' ? 'en-US' : 'es-ES'
    utterance.onend = () => setSpeaking(null)
    speechSynthesis.speak(utterance)
    setSpeaking(id)
  }

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('legalScripts')}</h1>
        <p className="text-white/80">
          Pre-written phrases to protect your rights during police interactions
        </p>
      </div>

      {/* AI-Powered Scripts Section */}
      {(hasPremiumAccess() && apiConfigValid) && (
        <InfoCard variant="highlighted">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-accent" />
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'en' ? 'AI-Powered Legal Scripts' : 'Guiones Legales con IA'}
                </h3>
              </div>
              <button
                onClick={() => generateAIScripts(selectedScenario)}
                disabled={isGenerating}
                className="btn-accent text-sm flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    {language === 'en' ? 'Generating...' : 'Generando...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {language === 'en' ? 'Generate Scripts' : 'Generar Guiones'}
                  </>
                )}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Select Scenario' : 'Seleccionar Escenario'}
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="traffic-stop">{language === 'en' ? 'Traffic Stop' : 'Control de Tráfico'}</option>
                <option value="questioning">{language === 'en' ? 'Police Questioning' : 'Interrogatorio Policial'}</option>
                <option value="search-consent">{language === 'en' ? 'Search Consent' : 'Consentimiento de Registro'}</option>
                <option value="arrest">{language === 'en' ? 'Arrest' : 'Arresto'}</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {userLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-blue-800 text-sm">
                  📍 {language === 'en' ? 'Location:' : 'Ubicación:'} {userLocation.address?.formattedAddress || 'Unknown'}
                </p>
              </div>
            )}

            {aiScripts && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">
                  {language === 'en' ? 'Generated Scripts:' : 'Guiones Generados:'}
                </h4>
                {aiScripts.scripts?.map((script, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-md p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium mb-1">{script.text}</p>
                        <p className="text-sm text-gray-600">{script.usage}</p>
                        {script.priority === 'high' && (
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-2">
                            {language === 'en' ? 'High Priority' : 'Alta Prioridad'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => speakScript(script.text, `ai-${index}`)}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {speaking === `ai-${index}` ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                          onClick={() => copyScript(script.text, `ai-${index}`)}
                          className="p-2 text-gray-600 hover:text-accent hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {copiedScript === `ai-${index}` ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {aiScripts.guidance && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                    <h5 className="font-medium text-yellow-800 mb-1">
                      {language === 'en' ? 'Guidance:' : 'Orientación:'}
                    </h5>
                    <p className="text-yellow-700 text-sm">{aiScripts.guidance}</p>
                  </div>
                )}

                {aiScripts.stateSpecific && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h5 className="font-medium text-blue-800 mb-1">
                      {language === 'en' ? 'State-Specific Information:' : 'Información Específica del Estado:'}
                    </h5>
                    <p className="text-blue-700 text-sm">{aiScripts.stateSpecific}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* Standard Scripts */}
      <div className="space-y-6">
        {scenarios.map(scenario => (
          <InfoCard key={scenario.id}>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {scenario.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {scenario.guidance[language]}
              </p>
              
              <div className="space-y-3">
                {scenario.scripts[language].map((script, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{script}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => speakScript(script, `${scenario.id}-${index}`)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-white rounded-md transition-colors"
                        title="Speak aloud"
                      >
                        {speaking === `${scenario.id}-${index}` ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>
                      
                      <button
                        onClick={() => copyScript(script, `${scenario.id}-${index}`)}
                        className="p-2 text-gray-600 hover:text-accent hover:bg-white rounded-md transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedScript === `${scenario.id}-${index}` ? (
                          <Check size={16} className="text-accent" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </InfoCard>
        ))}
      </div>

      <InfoCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {language === 'en' ? 'Important Reminders' : 'Recordatorios Importantes'}
          </h3>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li>• {language === 'en' 
              ? 'Always remain calm and respectful' 
              : 'Siempre manténgase calmado y respetuoso'}</li>
            <li>• {language === 'en' 
              ? 'Keep your hands visible at all times' 
              : 'Mantenga sus manos visibles en todo momento'}</li>
            <li>• {language === 'en' 
              ? 'Do not argue or physically resist' 
              : 'No discuta ni resista físicamente'}</li>
            <li>• {language === 'en' 
              ? 'Remember: you have the right to remain silent' 
              : 'Recuerde: tiene derecho a permanecer en silencio'}</li>
          </ul>
        </div>
      </InfoCard>
    </div>
  )
}

export default LegalScripts
