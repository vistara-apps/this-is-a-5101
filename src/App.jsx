import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import LegalScripts from './components/LegalScripts'
import IncidentRecorder from './components/IncidentRecorder'
import LocationInfo from './components/LocationInfo'
import History from './components/History'
import Settings from './components/Settings'
import { LanguageProvider } from './contexts/LanguageContext'
import { UserProvider } from './contexts/UserContext'

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard setActiveSection={setActiveSection} />
      case 'scripts':
        return <LegalScripts />
      case 'recorder':
        return <IncidentRecorder />
      case 'location':
        return <LocationInfo />
      case 'history':
        return <History />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard setActiveSection={setActiveSection} />
    }
  }

  return (
    <UserProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          
          <div className="flex">
            <Sidebar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            
            <main className="flex-1 p-4 md:p-6 lg:ml-64">
              <div className="max-w-7xl mx-auto">
                {renderActiveSection()}
              </div>
            </main>
          </div>
        </div>
      </LanguageProvider>
    </UserProvider>
  )
}

export default App