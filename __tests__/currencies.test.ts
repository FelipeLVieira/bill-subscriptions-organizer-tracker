import {
  PREDEFINED_CURRENCIES,
  getCurrencyByCode,
  getDefaultCurrencyForLocale,
  Currency,
} from '../src/constants/Currencies';

describe('Currency Constants', () => {
  describe('PREDEFINED_CURRENCIES', () => {
    it('should have at least 40 predefined currencies', () => {
      expect(PREDEFINED_CURRENCIES.length).toBeGreaterThanOrEqual(40);
    });

    it('should have unique currency codes', () => {
      const codes = PREDEFINED_CURRENCIES.map(c => c.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should have all required fields for each currency', () => {
      PREDEFINED_CURRENCIES.forEach((currency: Currency) => {
        expect(currency.code).toBeDefined();
        expect(currency.code.length).toBeGreaterThan(0);
        expect(currency.symbol).toBeDefined();
        expect(currency.symbol.length).toBeGreaterThan(0);
        expect(currency.name).toBeDefined();
        expect(currency.name.length).toBeGreaterThan(0);
      });
    });

    it('should have flags for all currencies', () => {
      PREDEFINED_CURRENCIES.forEach((currency: Currency) => {
        expect(currency.flag).toBeDefined();
        expect(currency.flag?.length).toBeGreaterThan(0);
      });
    });

    it('should contain common currencies', () => {
      const codes = PREDEFINED_CURRENCIES.map(c => c.code);
      expect(codes).toContain('USD');
      expect(codes).toContain('EUR');
      expect(codes).toContain('GBP');
      expect(codes).toContain('JPY');
      expect(codes).toContain('BRL');
      expect(codes).toContain('CAD');
      expect(codes).toContain('AUD');
      expect(codes).toContain('CNY');
    });
  });

  describe('getCurrencyByCode', () => {
    it('should return USD currency for "USD" code', () => {
      const usd = getCurrencyByCode('USD');
      expect(usd).toBeDefined();
      expect(usd?.code).toBe('USD');
      expect(usd?.symbol).toBe('$');
      expect(usd?.name).toBe('US Dollar');
    });

    it('should return EUR currency for "EUR" code', () => {
      const eur = getCurrencyByCode('EUR');
      expect(eur).toBeDefined();
      expect(eur?.code).toBe('EUR');
      expect(eur?.symbol).toBe('€');
    });

    it('should return undefined for non-existent currency code', () => {
      const unknown = getCurrencyByCode('XYZ');
      expect(unknown).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const usd = getCurrencyByCode('usd');
      expect(usd).toBeUndefined();
    });
  });

  describe('getDefaultCurrencyForLocale', () => {
    it('should return USD for en-US locale', () => {
      const currency = getDefaultCurrencyForLocale('en-US');
      expect(currency.code).toBe('USD');
    });

    it('should return GBP for en-GB locale', () => {
      const currency = getDefaultCurrencyForLocale('en-GB');
      expect(currency.code).toBe('GBP');
    });

    it('should return EUR for de locale', () => {
      const currency = getDefaultCurrencyForLocale('de');
      expect(currency.code).toBe('EUR');
    });

    it('should return EUR for fr locale', () => {
      const currency = getDefaultCurrencyForLocale('fr');
      expect(currency.code).toBe('EUR');
    });

    it('should return BRL for pt-BR locale', () => {
      const currency = getDefaultCurrencyForLocale('pt-BR');
      expect(currency.code).toBe('BRL');
    });

    it('should return JPY for ja locale', () => {
      const currency = getDefaultCurrencyForLocale('ja');
      expect(currency.code).toBe('JPY');
    });

    it('should return CNY for zh-CN locale', () => {
      const currency = getDefaultCurrencyForLocale('zh-CN');
      expect(currency.code).toBe('CNY');
    });

    it('should return TWD for zh-TW locale', () => {
      const currency = getDefaultCurrencyForLocale('zh-TW');
      expect(currency.code).toBe('TWD');
    });

    it('should return CAD for en-CA locale', () => {
      const currency = getDefaultCurrencyForLocale('en-CA');
      expect(currency.code).toBe('CAD');
    });

    it('should return AUD for en-AU locale', () => {
      const currency = getDefaultCurrencyForLocale('en-AU');
      expect(currency.code).toBe('AUD');
    });

    it('should fall back to base language when locale variant is not found', () => {
      // For a locale like "en-XX" (not specifically mapped),
      // it should fall back to "en" which maps to USD
      const currency = getDefaultCurrencyForLocale('en-XX');
      expect(currency.code).toBe('USD');
    });

    it('should return USD for unknown locales', () => {
      const currency = getDefaultCurrencyForLocale('unknown');
      expect(currency.code).toBe('USD');
    });

    it('should return valid currency object with all fields', () => {
      const currency = getDefaultCurrencyForLocale('en-US');
      expect(currency.code).toBeDefined();
      expect(currency.symbol).toBeDefined();
      expect(currency.name).toBeDefined();
    });
  });
});
