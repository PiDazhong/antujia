import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('ar');
  const location = useLocation();

  useEffect(() => {
    const excluded = ['/manage', '/analysis'];
    if (excluded.includes(location.pathname)) {
      document.documentElement.dir = 'ltr';
    } else {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
    document.documentElement.lang = lang;
  }, [lang, location.pathname]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
