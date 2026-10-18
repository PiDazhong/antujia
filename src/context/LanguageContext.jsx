'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('ar');
  const pathname = usePathname();

  useEffect(() => {
    const excluded = ['/manage'];
    if (excluded.includes(pathname)) {
      document.documentElement.dir = 'ltr';
    } else {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
    document.documentElement.lang = lang;
  }, [lang, pathname]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
