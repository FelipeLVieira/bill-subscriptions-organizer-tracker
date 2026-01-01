export interface Language {
  code: string;
  label: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  nativeName: string;
}

// Languages sorted: en-US first, then alphabetically by label
export const SUPPORTED_LANGUAGES: Language[] = [
  // English (US) first
  { code: "en-US", label: "English (US)", flag: "🇺🇸", currency: "USD", currencySymbol: "$", nativeName: "English (US)" },
  // Then alphabetically
  { code: "ar", label: "Arabic", flag: "🇸🇦", currency: "SAR", currencySymbol: "﷼", nativeName: "العربية" },
  { code: "ca", label: "Catalan", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", nativeName: "Català" },
  { code: "zh-CN", label: "Chinese (Simplified)", flag: "🇨🇳", currency: "CNY", currencySymbol: "¥", nativeName: "简体中文" },
  { code: "zh-TW", label: "Chinese (Traditional)", flag: "🇹🇼", currency: "TWD", currencySymbol: "NT$", nativeName: "繁體中文" },
  { code: "hr", label: "Croatian", flag: "🇭🇷", currency: "EUR", currencySymbol: "€", nativeName: "Hrvatski" },
  { code: "cs", label: "Czech", flag: "🇨🇿", currency: "CZK", currencySymbol: "Kč", nativeName: "Čeština" },
  { code: "da", label: "Danish", flag: "🇩🇰", currency: "DKK", currencySymbol: "kr", nativeName: "Dansk" },
  { code: "nl", label: "Dutch", flag: "🇳🇱", currency: "EUR", currencySymbol: "€", nativeName: "Nederlands" },
  { code: "en", label: "English", flag: "🇺🇸", currency: "USD", currencySymbol: "$", nativeName: "English" },
  { code: "en-AU", label: "English (Australia)", flag: "🇦🇺", currency: "AUD", currencySymbol: "A$", nativeName: "English (AU)" },
  { code: "en-CA", label: "English (Canada)", flag: "🇨🇦", currency: "CAD", currencySymbol: "C$", nativeName: "English (CA)" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧", currency: "GBP", currencySymbol: "£", nativeName: "English (UK)" },
  { code: "fi", label: "Finnish", flag: "🇫🇮", currency: "EUR", currencySymbol: "€", nativeName: "Suomi" },
  { code: "fr", label: "French", flag: "🇫🇷", currency: "EUR", currencySymbol: "€", nativeName: "Français" },
  { code: "fr-CA", label: "French (Canada)", flag: "🇨🇦", currency: "CAD", currencySymbol: "C$", nativeName: "Français (CA)" },
  { code: "de", label: "German", flag: "🇩🇪", currency: "EUR", currencySymbol: "€", nativeName: "Deutsch" },
  { code: "el", label: "Greek", flag: "🇬🇷", currency: "EUR", currencySymbol: "€", nativeName: "Ελληνικά" },
  { code: "he", label: "Hebrew", flag: "🇮🇱", currency: "ILS", currencySymbol: "₪", nativeName: "עברית" },
  { code: "hi", label: "Hindi", flag: "🇮🇳", currency: "INR", currencySymbol: "₹", nativeName: "हिन्दी" },
  { code: "hu", label: "Hungarian", flag: "🇭🇺", currency: "HUF", currencySymbol: "Ft", nativeName: "Magyar" },
  { code: "id", label: "Indonesian", flag: "🇮🇩", currency: "IDR", currencySymbol: "Rp", nativeName: "Bahasa Indonesia" },
  { code: "it", label: "Italian", flag: "🇮🇹", currency: "EUR", currencySymbol: "€", nativeName: "Italiano" },
  { code: "ja", label: "Japanese", flag: "🇯🇵", currency: "JPY", currencySymbol: "¥", nativeName: "日本語" },
  { code: "ko", label: "Korean", flag: "🇰🇷", currency: "KRW", currencySymbol: "₩", nativeName: "한국어" },
  { code: "ms", label: "Malay", flag: "🇲🇾", currency: "MYR", currencySymbol: "RM", nativeName: "Bahasa Melayu" },
  { code: "no", label: "Norwegian", flag: "🇳🇴", currency: "NOK", currencySymbol: "kr", nativeName: "Norsk" },
  { code: "pl", label: "Polish", flag: "🇵🇱", currency: "PLN", currencySymbol: "zł", nativeName: "Polski" },
  { code: "pt-BR", label: "Portuguese (Brazil)", flag: "🇧🇷", currency: "BRL", currencySymbol: "R$", nativeName: "Português (BR)" },
  { code: "pt-PT", label: "Portuguese (Portugal)", flag: "🇵🇹", currency: "EUR", currencySymbol: "€", nativeName: "Português (PT)" },
  { code: "ro", label: "Romanian", flag: "🇷🇴", currency: "RON", currencySymbol: "lei", nativeName: "Română" },
  { code: "ru", label: "Russian", flag: "🇷🇺", currency: "RUB", currencySymbol: "₽", nativeName: "Русский" },
  { code: "sk", label: "Slovak", flag: "🇸🇰", currency: "EUR", currencySymbol: "€", nativeName: "Slovenčina" },
  { code: "es", label: "Spanish", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", nativeName: "Español" },
  { code: "es-MX", label: "Spanish (Mexico)", flag: "🇲🇽", currency: "MXN", currencySymbol: "$", nativeName: "Español (MX)" },
  { code: "es-ES", label: "Spanish (Spain)", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", nativeName: "Español (ES)" },
  { code: "sv", label: "Swedish", flag: "🇸🇪", currency: "SEK", currencySymbol: "kr", nativeName: "Svenska" },
  { code: "th", label: "Thai", flag: "🇹🇭", currency: "THB", currencySymbol: "฿", nativeName: "ไทย" },
  { code: "tr", label: "Turkish", flag: "🇹🇷", currency: "TRY", currencySymbol: "₺", nativeName: "Türkçe" },
  { code: "uk", label: "Ukrainian", flag: "🇺🇦", currency: "UAH", currencySymbol: "₴", nativeName: "Українська" },
  { code: "vi", label: "Vietnamese", flag: "🇻🇳", currency: "VND", currencySymbol: "₫", nativeName: "Tiếng Việt" }
];

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function getCurrencyForLocale(locale: string): { currency: string; symbol: string } {
  const language = getLanguageByCode(locale);
  if (language) {
    return { currency: language.currency, symbol: language.currencySymbol };
  }
  // Fallback to base language (e.g., "en-US" -> "en")
  const baseLocale = locale.split('-')[0];
  const baseLang = SUPPORTED_LANGUAGES.find(lang => lang.code === baseLocale);
  if (baseLang) {
    return { currency: baseLang.currency, symbol: baseLang.currencySymbol };
  }
  // Default to USD
  return { currency: 'USD', symbol: '$' };
}
