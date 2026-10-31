import React from 'react';
import { useAppLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = '' }) => {
  const { currentLang, changeLanguage } = useAppLanguage();

  return (
    <div className={`inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm ${className}`}>
      <Globe className="w-4 h-4 text-gray-500 ml-1.5 mr-1" />
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
          currentLang === 'en'
            ? 'bg-agri-700 text-white shadow-xs'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('am')}
        className={`px-2.5 py-1 text-xs font-semibold rounded font-ethiopic transition-colors ${
          currentLang === 'am'
            ? 'bg-agri-700 text-white shadow-xs'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        አማርኛ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
