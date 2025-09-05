import { 
  Home, 
  FileText, 
  Mic, 
  MapPin, 
  History as HistoryIcon, 
  Settings as SettingsIcon,
  X
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const Sidebar = ({ activeSection, setActiveSection, isOpen, onClose }) => {
  const { t } = useLanguage()

  const menuItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard') },
    { id: 'scripts', icon: FileText, label: t('legalScripts') },
    { id: 'recorder', icon: Mic, label: t('incidentRecorder') },
    { id: 'location', icon: MapPin, label: t('locationInfo') },
    { id: 'history', icon: HistoryIcon, label: t('history') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') }
  ]

  const handleItemClick = (id) => {
    setActiveSection(id)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white/10 backdrop-blur-md 
        border-r border-white/20 z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-auto lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-white font-medium">Menu</span>
          <button
            onClick={onClose}
            className="p-1 text-white hover:bg-white/10 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleItemClick(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left
                ${activeSection === id 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar