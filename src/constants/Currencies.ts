export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag?: string;
}

export interface UserCurrency extends Currency {
  isCustom?: boolean;
  isDefault?: boolean;
}

export const PREDEFINED_CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", flag: "🇹🇼" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
  { code: "CLP", symbol: "$", name: "Chilean Peso", flag: "🇨🇱" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "COP", symbol: "$", name: "Colombian Peso", flag: "🇨🇴" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", flag: "🇵🇪" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "ARS", symbol: "$", name: "Argentine Peso", flag: "🇦🇷" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound", flag: "🇪🇬" },
];

export function getCurrencyByCode(code: string): Currency | undefined {
  return PREDEFINED_CURRENCIES.find(c => c.code === code);
}

export function getDefaultCurrencyForLocale(locale: string): Currency {
  const localeToDefaultCurrency: Record<string, string> = {
    "ar": "SAR",
    "ca": "EUR",
    "zh-CN": "CNY",
    "zh-TW": "TWD",
    "hr": "EUR",
    "cs": "CZK",
    "da": "DKK",
    "nl": "EUR",
    "en": "USD",
    "en-AU": "AUD",
    "en-CA": "CAD",
    "en-GB": "GBP",
    "en-US": "USD",
    "fi": "EUR",
    "fr": "EUR",
    "fr-CA": "CAD",
    "de": "EUR",
    "el": "EUR",
    "he": "ILS",
    "hi": "INR",
    "hu": "HUF",
    "id": "IDR",
    "it": "EUR",
    "ja": "JPY",
    "ko": "KRW",
    "ms": "MYR",
    "no": "NOK",
    "pl": "PLN",
    "pt-BR": "BRL",
    "pt-PT": "EUR",
    "ro": "RON",
    "ru": "RUB",
    "sk": "EUR",
    "es": "MXN",
    "es-MX": "MXN",
    "es-ES": "EUR",
    "sv": "SEK",
    "th": "THB",
    "tr": "TRY",
    "uk": "UAH",
    "vi": "VND",
  };

  const currencyCode = localeToDefaultCurrency[locale] ||
    localeToDefaultCurrency[locale.split('-')[0]] ||
    "USD";

  return getCurrencyByCode(currencyCode) || PREDEFINED_CURRENCIES[0];
}
