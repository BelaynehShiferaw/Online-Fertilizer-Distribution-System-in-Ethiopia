import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('ofdms_lang') || 'en';
  });

  useEffect(() => {
    i18n.changeLanguage(currentLang);
    localStorage.setItem('ofdms_lang', currentLang);
    document.documentElement.lang = currentLang;
  }, [currentLang, i18n]);

  const changeLanguage = async (newLang) => {
    if (newLang !== 'en' && newLang !== 'am') return;
    setCurrentLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('ofdms_lang', newLang);
    document.documentElement.lang = newLang;

    // Persist to user profile on server if authenticated
    try {
      const token = localStorage.getItem('ofdms_token');
      if (token) {
        await api.patch('/users/me', { preferredLanguage: newLang });
      }
    } catch (e) {
      // Non-blocking
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        changeLanguage,
        isAmharic: currentLang === 'am',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useAppLanguage = () => useContext(LanguageContext);
