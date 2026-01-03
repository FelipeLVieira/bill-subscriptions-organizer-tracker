// Note: These tests mock i18n since the actual i18n requires runtime setup
// The tests focus on the logic and structure of categories

// Mock expo-localization (required by i18n)
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

// Mock i18n-js to avoid full initialization
jest.mock('i18n-js', () => {
  return {
    I18n: class MockI18n {
      translations: Record<string, Record<string, string>> = {};
      locale = 'en';
      enableFallback = true;

      constructor(translations: Record<string, Record<string, string>>) {
        this.translations = translations;
      }

      t(key: string): string {
        const mockTranslations: Record<string, string> = {
          'cat_entertainment': 'Entertainment',
          'cat_utilities': 'Utilities',
          'cat_housing': 'Housing',
          'cat_insurance': 'Insurance',
          'cat_personal_care': 'Personal Care',
          'cat_software': 'Software',
          'cat_other': 'Other',
        };
        return mockTranslations[key] || key;
      }
    },
  };
});

import { getSubscriptionCategories, getCategoryLabel } from '../src/constants/categories';

describe('Categories', () => {
  describe('getSubscriptionCategories', () => {
    it('should return an array of categories', () => {
      const categories = getSubscriptionCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should have 7 default categories', () => {
      const categories = getSubscriptionCategories();
      expect(categories.length).toBe(7);
    });

    it('should have label and value for each category', () => {
      const categories = getSubscriptionCategories();
      categories.forEach(category => {
        expect(category.label).toBeDefined();
        expect(category.label.length).toBeGreaterThan(0);
        expect(category.value).toBeDefined();
        expect(category.value.length).toBeGreaterThan(0);
      });
    });

    it('should contain essential categories', () => {
      const categories = getSubscriptionCategories();
      const values = categories.map(c => c.value);

      expect(values).toContain('Entertainment');
      expect(values).toContain('Utilities');
      expect(values).toContain('Housing');
      expect(values).toContain('Insurance');
      expect(values).toContain('Software');
      expect(values).toContain('Other');
    });

    it('should have unique values', () => {
      const categories = getSubscriptionCategories();
      const values = categories.map(c => c.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have consistent value format (Title Case)', () => {
      const categories = getSubscriptionCategories();
      categories.forEach(category => {
        // Value should start with uppercase
        expect(category.value[0]).toBe(category.value[0].toUpperCase());
      });
    });
  });

  describe('getCategoryLabel', () => {
    it('should return translated label for known category', () => {
      const label = getCategoryLabel('Entertainment');
      expect(label).toBe('Entertainment');
    });

    it('should return translated label for Utilities', () => {
      const label = getCategoryLabel('Utilities');
      expect(label).toBe('Utilities');
    });

    it('should return the value itself for unknown category', () => {
      const customCategory = 'My Custom Category';
      const label = getCategoryLabel(customCategory);
      expect(label).toBe(customCategory);
    });

    it('should handle empty string', () => {
      const label = getCategoryLabel('');
      expect(label).toBe('');
    });

    it('should return all category labels correctly', () => {
      const categories = getSubscriptionCategories();
      categories.forEach(category => {
        const label = getCategoryLabel(category.value);
        expect(label).toBe(category.label);
      });
    });
  });

  describe('Category structure consistency', () => {
    it('should have Other as the last category', () => {
      const categories = getSubscriptionCategories();
      const lastCategory = categories[categories.length - 1];
      expect(lastCategory.value).toBe('Other');
    });

    it('should have Entertainment as the first category', () => {
      const categories = getSubscriptionCategories();
      const firstCategory = categories[0];
      expect(firstCategory.value).toBe('Entertainment');
    });
  });
});
