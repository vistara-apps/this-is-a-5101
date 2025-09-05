import { useState, useEffect } from 'react'
import { MapPin, Info, Phone, ExternalLink } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import InfoCard from './InfoCard'

const LocationInfo = () => {
  const { t, language } = useLanguage()
  const [location, setLocation] = useState(null)
  const [locationInfo, setLocationInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getLocation()
  }, [])

  const getLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setLocation(coords)
          fetchLocationInfo(coords)
        },
        (error) => {
          console.error('Location error:', error)
          setLoading(false)
          // Fallback to demo data
          setLocationInfo(getDemoLocationInfo())
        }
      )
    } else {
      setLoading(false)
      setLocationInfo(getDemoLocationInfo())
    }
  }

  const fetchLocationInfo = async (coords) => {
    try {
      // In a real app, this would call actual APIs
      // For demo, we'll use simulated data
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLocationInfo(getDemoLocationInfo())
    } catch (error) {
      console.error('Error fetching location info:', error)
      setLocationInfo(getDemoLocationInfo())
    } finally {
      setLoading(false)
    }
  }

  const getDemoLocationInfo = () => {
    return {
      state: 'California',
      city: 'Los Angeles',
      county: 'Los Angeles County',
      address: '123 Main St, Los Angeles, CA',
      legalInfo: {
        en: {
          summary: 'California is a two-party consent state for recording conversations. However, you have the right to record police in public spaces.',
          rights: [
            'You have the right to remain silent',
            'You have the right to refuse searches without a warrant',
            'You have the right to record police in public',
            'You have the right to an attorney'
          ],
          importantNotes: [
            'California Penal Code 148(g) makes it illegal to interfere with police duties',
            'Keep a reasonable distance when recording',
            'Do not physically resist even if you believe the stop is unlawful'
          ]
        },
        es: {
          summary: 'California es un estado de consentimiento de dos partes para grabar conversaciones. Sin embargo, tienes derecho a grabar a la policía en espacios públicos.',
          rights: [
            'Tienes derecho a permanecer en silencio',
            'Tienes derecho a rechazar registros sin una orden judicial',
            'Tienes derecho a grabar a la policía en público',
            'Tienes derecho a un abogado'
          ],
          importantNotes: [
            'El Código Penal de California 148(g) hace ilegal interferir con los deberes policiales',
            'Mantén una distancia razonable al grabar',
            'No resistas físicamente aunque creas que la parada es ilegal'
          ]
        }
      },
      emergencyContacts: [
        { name: 'Emergency Services', number: '911' },
        { name: 'ACLU of Southern California', number: '(213) 977-9500' },
        { name: 'LA Public Defender', number: '(213) 974-3062' },
        { name: 'Legal Aid Foundation', number: '(323) 801-7991' }
      ]
    }
  }

  const currentInfo = locationInfo?.legalInfo?.[language]

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('locationInfo')}</h1>
        <p className="text-white/80">
          Location-specific legal information and emergency contacts
        </p>
      </div>

      {/* Current Location */}
      <InfoCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-md">
              <MapPin size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Current Location</h3>
          </div>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : locationInfo ? (
            <div className="space-y-2">
              <p className="font-medium">{locationInfo.address}</p>
              <p className="text-gray-600">{locationInfo.city}, {locationInfo.state}</p>
              <p className="text-gray-600">{locationInfo.county}</p>
            </div>
          ) : (
            <p className="text-gray-500">Unable to determine location</p>
          )}
          
          <button 
            onClick={getLocation}
            className="mt-4 btn-primary text-sm"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Location'}
          </button>
        </div>
      </InfoCard>

      {/* Legal Summary */}
      {currentInfo && (
        <InfoCard variant="highlighted">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent rounded-md">
                <Info size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {language === 'en' ? 'Legal Summary' : 'Resumen Legal'}
              </h3>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">
              {currentInfo.summary}
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  {language === 'en' ? 'Your Rights:' : 'Sus Derechos:'}
                </h4>
                <ul className="space-y-1">
                  {currentInfo.rights.map((right, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      {right}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  {language === 'en' ? 'Important Notes:' : 'Notas Importantes:'}
                </h4>
                <ul className="space-y-1">
                  {currentInfo.importantNotes.map((note, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-yellow-500 font-bold">⚠</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Emergency Contacts */}
      {locationInfo && (
        <InfoCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500 rounded-md">
                <Phone size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {language === 'en' ? 'Emergency Contacts' : 'Contactos de Emergencia'}
              </h3>
            </div>
            
            <div className="space-y-3">
              {locationInfo.emergencyContacts.map((contact, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="font-medium text-gray-800">{contact.name}</span>
                  <a 
                    href={`tel:${contact.number}`}
                    className="flex items-center gap-2 text-primary hover:text-blue-600"
                  >
                    <Phone size={16} />
                    <span>{contact.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </InfoCard>
      )}

      {/* Additional Resources */}
      <InfoCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {language === 'en' ? 'Additional Resources' : 'Recursos Adicionales'}
          </h3>
          
          <div className="space-y-3">
            <a 
              href="https://www.aclu.org/know-your-rights"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-800">ACLU Know Your Rights</span>
              <ExternalLink size={16} className="text-gray-600" />
            </a>
            
            <a 
              href="https://www.nolo.com/legal-encyclopedia/police-stops"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-800">
                {language === 'en' ? 'Police Stops Legal Guide' : 'Guía Legal de Paradas Policiales'}
              </span>
              <ExternalLink size={16} className="text-gray-600" />
            </a>
          </div>
        </div>
      </InfoCard>
    </div>
  )
}

export default LocationInfo