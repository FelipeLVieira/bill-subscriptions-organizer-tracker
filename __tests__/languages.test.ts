import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  getCurrencyForLocale,
  Language,
} from '../src/constants/Languages';

describe('Language Constants', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should have at least 40 supported languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(40);
    });

    it('should have unique language codes', () => {
      const codes = SUPPORTED_LANGUAGES.map(lang => lang.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should have all required fields for each language', () => {
      SUPPORTED_LANGUAGES.forEach((language: Language) => {
        expect(language.code).toBeDefined();
        expect(language.code.length).toBeGreaterThan(0);
        expect(language.label).toBeDefined();
        expect(language.label.length).toBeGreaterThan(0);
        expect(language.flag).toBeDefined();
        expect(language.flag.length).toBeGreaterThan(0);
        expect(language.currency).toBeDefined();
        expect(language.currency.length).toBe(3); // ISO 4217 codes are 3 chars
        expect(language.currencySymbol).toBeDefined();
        expect(language.currencySymbol.length).toBeGreaterThan(0);
        expect(language.nativeName).toBeDefined();
        expect(language.nativeName.length).toBeGreaterThan(0);
      });
    });

    it('should have en-US as the first language', () => {
      expect(SUPPORTED_LANGUAGES[0].code).toBe('en-US');
    });

    it('should contain major world languages', () => {
      const codes = SUPPORTED_LANGUAGES.map(lang => lang.code);
      expect(codes).toContain('en-US');
      expect(codes).toContain('es');
      expect(codes).toContain('fr');
      expect(codes).toContain('de');
      expect(codes).toContain('pt-BR');
      expect(codes).toContain('ja');
      expect(codes).toContain('zh-CN');
      expect(codes).toContain('ko');
      expect(codes).toContain('ar');
      expect(codes).toContain('hi');
    });

    it('should have valid emoji flags', () => {
      SUPPORTED_LANGUAGES.forEach((language: Language) => {
        // Emoji flags are usually 2 regional indicator symbols (4 bytes each)
        // or at minimum should be non-empty
        expect(language.flag.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('getLanguageByCode', () => {
    it('should return correct language for en-US', () => {
      const lang = getLanguageByCode('en-US');
      expect(lang).toBeDefined();
      expect(lang?.code).toBe('en-US');
      expect(lang?.label).toBe('English (US)');
      expect(lang?.currency).toBe('USD');
    });

    it('should return correct language for pt-BR', () => {
      const lang = getLanguageByCode('pt-BR');
      expect(lang).toBeDefined();
      expect(lang?.code).toBe('pt-BR');
      expect(lang?.currency).toBe('BRL');
      expect(lang?.currencySymbol).toBe('R$');
    });

    it('should return correct language for ja', () => {
      const lang = getLanguageByCode('ja');
      expect(lang).toBeDefined();
      expect(lang?.code).toBe('ja');
      expect(lang?.currency).toBe('JPY');
      expect(lang?.nativeName).toBe('日本語');
    });

    it('should return undefined for non-existent language code', () => {
      const lang = getLanguageByCode('xx-XX');
      expect(lang).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const lang = getLanguageByCode('EN-US');
      expect(lang).toBeUndefined();
    });
  });

  describe('getCurrencyForLocale', () => {
    it('should return USD for en-US', () => {
      const result = getCurrencyForLocale('en-US');
      expect(result.currency).toBe('USD');
      expect(result.symbol).toBe('$');
    });

    it('should return EUR for de', () => {
      const result = getCurrencyForLocale('de');
      expect(result.currency).toBe('EUR');
      expect(result.symbol).toBe('€');
    });

    it('should return BRL for pt-BR', () => {
      const result = getCurrencyForLocale('pt-BR');
      expect(result.currency).toBe('BRL');
      expect(result.symbol).toBe('R$');
    });

    it('should return GBP for en-GB', () => {
      const result = getCurrencyForLocale('en-GB');
      expect(result.currency).toBe('GBP');
      expect(result.symbol).toBe('£');
    });

    it('should return JPY for ja', () => {
      const result = getCurrencyForLocale('ja');
      expect(result.currency).toBe('JPY');
      expect(result.symbol).toBe('¥');
    });

    it('should fall back to base language when locale variant is not found', () => {
      // 'en-XX' should fall back to 'en' which maps to USD
      const result = getCurrencyForLocale('en-XX');
      expect(result.currency).toBe('USD');
      expect(result.symbol).toBe('$');
    });

    it('should return USD for completely unknown locales', () => {
      const result = getCurrencyForLocale('unknown');
      expect(result.currency).toBe('USD');
      expect(result.symbol).toBe('$');
    });

    it('should handle Eurozone countries correctly', () => {
      const euroCountries = ['de', 'fr', 'it', 'es', 'nl', 'pt-PT'];
      euroCountries.forEach(locale => {
        const result = getCurrencyForLocale(locale);
        expect(result.currency).toBe('EUR');
        expect(result.symbol).toBe('€');
      });
    });
  });
});
