import { useLanguage } from '../contexts/LanguageContext'

const LanguageSelector = ({ variant = 'default' }) => {
  const { language, setLanguage } = useLanguage()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ]

  return (
    <div className="space-y-3">
      {languages.map(lang => (
        <label 
          key={lang.code}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input
            type="radio"
            name="language"
            value={lang.code}
            checked={language === lang.code}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-primary focus:ring-primary"
          />
          <span className="text-2xl">{lang.flag}</span>
          <span className="font-medium text-gray-800">{lang.name}</span>
        </label>
      ))}
    </div>
  )
}

export default LanguageSelector