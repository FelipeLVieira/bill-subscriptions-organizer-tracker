export interface Language {
  code: string;
  label: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  nativeName: string;
  englishName: string; // Name in English alphabet for non-native speakers
}

// Languages sorted: en-US first, then alphabetically by label
export const SUPPORTED_LANGUAGES: Language[] = [
  // English (US) first
  { code: "en-US", label: "English (US)", flag: "🇺🇸", currency: "USD", currencySymbol: "$", nativeName: "English (US)", englishName: "English (US)" },
  // Then alphabetically
  { code: "ar", label: "Arabic", flag: "🇸🇦", currency: "SAR", currencySymbol: "﷼", nativeName: "العربية", englishName: "Arabic" },
  { code: "ca", label: "Catalan", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", nativeName: "Català", englishName: "Catalan" },
  { code: "zh-CN", label: "Chinese (Simplified)", flag: "🇨🇳", currency: "CNY", currencySymbol: "¥", nativeName: "简体中文", englishName: "Chinese (Simplified)" },
  { code: "zh-TW", label: "Chinese (Traditional)", flag: "🇹🇼", currency: "TWD", currencySymbol: "NT$", nativeName: "繁體中文", englishName: "Chinese (Traditional)" },
  { code: "hr", label: "Croatian", flag: "🇭🇷", currency: "EUR", currencySymbol: "€", nativeName: "Hrvatski", englishName: "Croatian" },
  { code: "cs", label: "Czech", flag: "🇨🇿", currency: "CZK", currencySymbol: "Kč", nativeName: "Čeština", englishName: "Czech" },
  { code: "da", label: "Danish", flag: "🇩🇰", currency: "DKK", currencySymbol: "kr", nativeName: "Dansk", englishName: "Danish" },
  { code: "nl", label: "Dutch", flag: "🇳🇱", currency: "EUR", currencySymbol: "€", nativeName: "Nederlands", englishName: "Dutch" },
  { code: "en", label: "English", flag: "🇺🇸", currency: "USD", currencySymbol: "$", nativeName: "English", englishName: "English" },
  { code: "en-AU", label: "English (Australia)", flag: "🇦🇺", currency: "AUD", currencySymbol: "A$", nativeName: "English (AU)", englishName: "English (Australia)" },
  { code: "en-CA", label: "English (Canada)", flag: "🇨🇦", currency: "CAD", currencySymbol: "C$", nativeName: "English (CA)", englishName: "English (Canada)" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧", currency: "GBP", currencySymbol: "£", nativeName: "English (UK)", englishName: "English (UK)" },
  { code: "fi", label: "Finnish", flag: "🇫🇮", currency: "EUR", currencySymbol: "€", nativeName: "Suomi", englishName: "Finnish" },
  { code: "fr", label: "French", flag: "🇫🇷", currency: "EUR", currencySymbol: "€", nativeName: "Français", englishName: "French" },
  { code: "fr-CA", label: "French (Canada)", flag: "🇨🇦", currency: "CAD", currencySymbol: "C$", nativeName: "Français (CA)", englishName: "French (Canada)" },
  { code: "de", label: "German", flag: "🇩🇪", currency: "EUR", currencySymbol: "€", nativeName: "Deutsch", englishName: "German" },
  { code: "el", label: "Greek", flag: "🇬🇷", currency: "EUR", currencySymbol: "€", nativeName: "Ελληνικά", englishName: "Greek" },
  { code: "he", label: "Hebrew", flag: "🇮🇱", currency: "ILS", currencySymbol: "₪", nativeName: "עברית", englishName: "Hebrew" },
  { code: "hi", label: "Hindi", flag: "🇮🇳", currency: "INR", currencySymbol: "₹", nativeName: "हिन्दी", englishName: "Hindi" },
  { code: "hu", label: "Hungarian", flag: "🇭🇺", currency: "HUF", currencySymbol: "Ft", nativeName: "Magyar", englishName: "Hungarian" },
  { code: "id", label: "Indonesian", flag: "🇮🇩", currency: "IDR", currencySymbol: "Rp", nativeName: "Bahasa Indonesia", englishName: "Indonesian" },
  { code: "it", label: "Italian", flag: "🇮🇹", currency: "EUR", currencySymbol: "€", nativeName: "Italiano", englishName: "Italian" },
  { code: "ja", label: "Japanese", flag: "🇯🇵", currency: "JPY", currencySymbol: "¥", nativeName: "日本語", englishName: "Japanese" },
  { code: "ko", label: "Korean", flag: "🇰🇷", currency: "KRW", currencySymbol: "₩", nativeName: "한국어", englishName: "Korean" },
  { code: "ms", label: "Malay", flag: "🇲🇾", currency: "MYR", currencySymbol: "RM", nativeName: "Bahasa Melayu", englishName: "Malay" },
  { code: "no", label: "Norwegian", flag: "🇳🇴", currency: "NOK", currencySymbol: "kr", nativeName: "Norsk", englishName: "Norwegian" },
  { code: "pl", label: "Polish", flag: "🇵🇱", currency: "PLN", currencySymbol: "zł", nativeName: "Polski", englishName: "Polish" },
  { code: "pt-BR", label: "Portuguese (Brazil)", flag: "🇧🇷", currency: "BRL", currencySymbol: "R$", nativeName: "Português (BR)", englishName: "Portuguese (Brazil)" },
  { code: "pt-PT", label: "Portuguese (Portugal)", flag: "🇵🇹", currency: "EUR", currencySymbol: "€", nativeName: "Português (PT)", englishName: "Portuguese (Portugal)" },
  { code: "ro", label: "Romanian", flag: "🇷🇴", currency: "RON", currencySymbol: "lei", nativeName: "Română", englishName: "Romanian" },
  { code: "ru", label: "Russian", flag: "🇷🇺", currency: "RUB", currencySymbol: "₽", nativeName: "Русский", englishName: "Russian" },
  { code: "sk", label: "Slovak", flag: "🇸🇰", currency: "EUR", currencySymbol: "€", nativeName: "Slovenčina", englishName: "Slovak" },
  { code: "es", label: "Spanish", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", nativeName: "Español", englishName: "Spanish" },
  { code: "es-MX", label: "Spanish (Mexico)", flag: "🇲🇽", currency: "MXN", currencySymbol: "$", nativeName: "Español (MX)", englishName: "Spanish (Mexico)" },
  { code: "es-ES", label: "Spanish (Spain)", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", nativeName: "Español (ES)", englishName: "Spanish (Spain)" },
  { code: "sv", label: "Swedish", flag: "🇸🇪", currency: "SEK", currencySymbol: "kr", nativeName: "Svenska", englishName: "Swedish" },
  { code: "th", label: "Thai", flag: "🇹🇭", currency: "THB", currencySymbol: "฿", nativeName: "ไทย", englishName: "Thai" },
  { code: "tr", label: "Turkish", flag: "🇹🇷", currency: "TRY", currencySymbol: "₺", nativeName: "Türkçe", englishName: "Turkish" },
  { code: "uk", label: "Ukrainian", flag: "🇺🇦", currency: "UAH", currencySymbol: "₴", nativeName: "Українська", englishName: "Ukrainian" },
  { code: "vi", label: "Vietnamese", flag: "🇻🇳", currency: "VND", currencySymbol: "₫", nativeName: "Tiếng Việt", englishName: "Vietnamese" }
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
