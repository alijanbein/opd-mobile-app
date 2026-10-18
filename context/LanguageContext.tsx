import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as tokenStorage from '../lib/tokenStorage';
import { translations, SUPPORTED_LANGUAGES, type Language } from '../i18n';

const LANGUAGE_KEY = 'app_language';

type LanguageSession = {
  language: Language;
  // False until the user has explicitly picked a language (first launch) or
  // a stored choice was found — gates the language-select screen in
  // app/_layout.tsx the same way AuthContext's token gates the auth stack.
  hasChosenLanguage: boolean;
  isLoading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageSession | null>(null);

function lookup(lang: Language, key: string): string | undefined {
  const path = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = translations[lang];
  for (const segment of path) {
    if (node == null) break;
    node = node[segment];
  }
  return typeof node === 'string' ? node : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await tokenStorage.getItem(LANGUAGE_KEY);
        if (stored === 'en' || stored === 'ar') {
          setLanguageState(stored);
          setHasChosenLanguage(true);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    setLanguageState(lang);
    setHasChosenLanguage(true);
    await tokenStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const raw = lookup(language, key) ?? lookup('en', key) ?? key;
    if (!vars) return raw;
    return Object.keys(vars).reduce(
      (str, name) => str.replace(new RegExp(`{{\\s*${name}\\s*}}`, 'g'), String(vars[name])),
      raw
    );
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, hasChosenLanguage, isLoading, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
