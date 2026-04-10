import { useLanguage } from '../contexts/LanguageContext'
import { FaGlobe } from 'react-icons/fa'

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { language, changeLanguage } = useLanguage()

  if (variant === 'compact') {
    return (
      <div className="relative group">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2">
          <FaGlobe className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {language === 'en' ? 'EN' : 'አማ'}
          </span>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
              language === 'en' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
            }`}
          >
            <span className="text-xl">🇬🇧</span>
            <span className="font-medium">English</span>
          </button>
          <button
            onClick={() => changeLanguage('am')}
            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 rounded-b-lg ${
              language === 'am' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
            }`}
          >
            <span className="text-xl">🇪🇹</span>
            <span className="font-medium">አማርኛ</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-4 py-2 rounded-md font-medium transition-all ${
          language === 'en'
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => changeLanguage('am')}
        className={`px-4 py-2 rounded-md font-medium transition-all ${
          language === 'am'
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        🇪🇹 አማ
      </button>
    </div>
  )
}

export default LanguageSwitcher
