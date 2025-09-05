import { useState } from 'react'
import { Copy, Check, Play, Pause } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import InfoCard from './InfoCard'

const LegalScripts = () => {
  const { t, language } = useLanguage()
  const [copiedScript, setCopiedScript] = useState(null)
  const [speaking, setSpeaking] = useState(null)

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