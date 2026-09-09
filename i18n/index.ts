import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enTabs from './locales/en/tabs.json';
import enProfile from './locales/en/profile.json';
import enAdmin from './locales/en/admin.json';
import enMisc from './locales/en/misc.json';

import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arTabs from './locales/ar/tabs.json';
import arProfile from './locales/ar/profile.json';
import arAdmin from './locales/ar/admin.json';
import arMisc from './locales/ar/misc.json';

// Same pattern as the web app's frontend/src/i18n — one namespace file per
// screen/feature area, looked up as "namespace.key" (see LanguageContext's
// t()). Keeps translation work on different screens from touching the same
// file.
export const translations = {
  en: {
    common: enCommon,
    auth: enAuth,
    tabs: enTabs,
    profile: enProfile,
    admin: enAdmin,
    misc: enMisc,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    tabs: arTabs,
    profile: arProfile,
    admin: arAdmin,
    misc: arMisc,
  },
} as const;

export type Language = 'en' | 'ar';
export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ar'];
