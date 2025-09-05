import { Menu, Shield, Globe } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useUser } from '../contexts/UserContext'

const Header = ({ onMenuClick, sidebarOpen }) => {
  const { t, toggleLanguage, language } = useLanguage()
  const { user } = useUser()

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <Shield className="text-white" size={24} />
            <div>
              <h1 className="text-white font-bold text-lg">{t('appName')}</h1>
              <p className="text-white/70 text-xs hidden sm:block">{t('tagline')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors text-sm"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'ES'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="text-white text-sm font-medium">
                {user.subscriptionStatus === 'premium' ? t('premium') : t('free')}
              </div>
              <div className="text-white/60 text-xs">{user.email}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header