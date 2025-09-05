import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

const translations = {
  en: {
    appName: 'PocketLegal',
    tagline: 'Your rights, anytime, anywhere',
    dashboard: 'Dashboard',
    legalScripts: 'Legal Scripts',
    incidentRecorder: 'Incident Recorder',
    locationInfo: 'Location Info',
    history: 'History',
    settings: 'Settings',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    knowYourRights: 'Know Your Rights',
    emergencyRecording: 'Emergency Recording',
    legalGuidance: 'Legal Guidance',
    myLocation: 'My Location',
    trafficStop: 'Traffic Stop',
    questioning: 'Questioning',
    searchWarrant: 'Search Warrant',
    arrest: 'Arrest',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    saveEncounter: 'Save Encounter',
    upgrade: 'Upgrade to Premium',
    free: 'Free',
    premium: 'Premium',
    monthlySubscription: '$4.99/month'
  },
  es: {
    appName: 'PocketLegal',
    tagline: 'Sus derechos, en cualquier momento, en cualquier lugar',
    dashboard: 'Panel',
    legalScripts: 'Guiones Legales',
    incidentRecorder: 'Grabadora de Incidentes',
    locationInfo: 'Información de Ubicación',
    history: 'Historial',
    settings: 'Configuración',
    quickActions: 'Acciones Rápidas',
    recentActivity: 'Actividad Reciente',
    knowYourRights: 'Conozca Sus Derechos',
    emergencyRecording: 'Grabación de Emergencia',
    legalGuidance: 'Orientación Legal',
    myLocation: 'Mi Ubicación',
    trafficStop: 'Control de Tráfico',
    questioning: 'Interrogatorio',
    searchWarrant: 'Orden de Registro',
    arrest: 'Arresto',
    startRecording: 'Iniciar Grabación',
    stopRecording: 'Detener Grabación',
    saveEncounter: 'Guardar Encuentro',
    upgrade: 'Actualizar a Premium',
    free: 'Gratis',
    premium: 'Premium',
    monthlySubscription: '$4.99/mes'
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const t = (key) => {
    return translations[language][key] || key
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en')
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}