import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './locales/en';
import pt from './locales/pt';

const i18n = new I18n({
    en,
    pt,
    'pt-BR': pt,
});

i18n.enableFallback = true;
i18n.locale = getLocales()[0].languageCode ?? 'en';

export default i18n;
