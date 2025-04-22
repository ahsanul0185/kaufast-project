import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 
  | 'ca-ES'    // Catalan
  | 'en-US'    // English (USA)
  | 'en-GB'    // English (UK)
  | 'fr-FR'    // French
  | 'es-MX'    // Spanish (Mexico)
  | 'es-ES'    // Spanish (Spain)
  | 'pt-PT'    // Portuguese (Portugal)
  | 'pt-BR'    // Portuguese (Brazil)
  | 'de-AT'    // German (Austria)
  | 'de-DE';   // German (Germany)

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'ca-ES', name: 'Catalan', nativeName: 'Català' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'de-AT', name: 'German (Austria)', nativeName: 'Deutsch (Österreich)' },
  { code: 'de-DE', name: 'German (Germany)', nativeName: 'Deutsch (Deutschland)' },
];

interface LanguageContextType {
  currentLanguage: LanguageCode;
  changeLanguage: (language: LanguageCode) => void;
  getLanguageByCode: (code: LanguageCode) => Language | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'inmobi_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en-US');

  useEffect(() => {
    // On mount, check localStorage and navigator.language
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
    
    if (storedLanguage && LANGUAGES.some(lang => lang.code === storedLanguage)) {
      setCurrentLanguage(storedLanguage);
    } else {
      // If no stored language, try to match browser language
      const browserLanguage = navigator.language;
      const matchedLanguage = LANGUAGES.find(lang => 
        browserLanguage.startsWith(lang.code.split('-')[0])
      );
      
      if (matchedLanguage) {
        setCurrentLanguage(matchedLanguage.code);
      }
      // Default to en-US is already set in state initializer
    }
  }, []);
  
  const changeLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    
    // Here you might integrate with i18n libraries or APIs
    // for translating UI content
    document.documentElement.lang = language;
  };
  
  const getLanguageByCode = (code: LanguageCode): Language | undefined => {
    return LANGUAGES.find(lang => lang.code === code);
  };
  
  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage,
      getLanguageByCode
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};