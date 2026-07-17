import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'np';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (en: string, np: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'np' : 'en'));
  };
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (en: string, np: string) => {
    return language === 'en' ? en : np;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
