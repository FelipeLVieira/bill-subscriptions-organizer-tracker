import {
  COMPANY_ICONS,
  getCompanyIcon,
  DEFAULT_ICON,
  CompanyIcon,
} from '../src/constants/companyIcons';

describe('Company Icons', () => {
  describe('COMPANY_ICONS', () => {
    it('should have at least 50 company icons', () => {
      const iconCount = Object.keys(COMPANY_ICONS).length;
      expect(iconCount).toBeGreaterThanOrEqual(50);
    });

    it('should have all required fields for each icon', () => {
      Object.entries(COMPANY_ICONS).forEach(([key, icon]) => {
        expect(icon.icon).toBeDefined();
        expect(icon.icon.length).toBeGreaterThan(0);
        expect(icon.color).toBeDefined();
        expect(icon.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should have lowercase keys', () => {
      Object.keys(COMPANY_ICONS).forEach(key => {
        expect(key).toBe(key.toLowerCase());
      });
    });

    it('should contain major streaming services', () => {
      expect(COMPANY_ICONS['netflix']).toBeDefined();
      expect(COMPANY_ICONS['spotify']).toBeDefined();
      expect(COMPANY_ICONS['disney+']).toBeDefined();
      expect(COMPANY_ICONS['hulu']).toBeDefined();
      expect(COMPANY_ICONS['youtube']).toBeDefined();
    });

    it('should contain major software services', () => {
      expect(COMPANY_ICONS['adobe']).toBeDefined();
      expect(COMPANY_ICONS['microsoft 365']).toBeDefined();
      expect(COMPANY_ICONS['notion']).toBeDefined();
      expect(COMPANY_ICONS['slack']).toBeDefined();
    });

    it('should contain utility types', () => {
      expect(COMPANY_ICONS['electricity']).toBeDefined();
      expect(COMPANY_ICONS['water']).toBeDefined();
      expect(COMPANY_ICONS['gas']).toBeDefined();
      expect(COMPANY_ICONS['internet']).toBeDefined();
    });

    it('should contain category defaults', () => {
      expect(COMPANY_ICONS['entertainment']).toBeDefined();
      expect(COMPANY_ICONS['software']).toBeDefined();
      expect(COMPANY_ICONS['utilities']).toBeDefined();
      expect(COMPANY_ICONS['housing']).toBeDefined();
    });
  });

  describe('getCompanyIcon', () => {
    it('should return correct icon for exact match', () => {
      const icon = getCompanyIcon('Netflix');
      expect(icon).toBeDefined();
      expect(icon?.color).toBe('#E50914');
    });

    it('should be case-insensitive', () => {
      const icon1 = getCompanyIcon('NETFLIX');
      const icon2 = getCompanyIcon('netflix');
      const icon3 = getCompanyIcon('Netflix');

      expect(icon1).toEqual(icon2);
      expect(icon2).toEqual(icon3);
    });

    it('should trim whitespace', () => {
      const icon = getCompanyIcon('  netflix  ');
      expect(icon).toBeDefined();
      expect(icon?.color).toBe('#E50914');
    });

    it('should find partial matches when name contains key', () => {
      const icon = getCompanyIcon('My Netflix Account');
      expect(icon).toBeDefined();
      expect(icon?.color).toBe('#E50914');
    });

    it('should return null for unknown companies', () => {
      const icon = getCompanyIcon('Some Random Company XYZ');
      expect(icon).toBeNull();
    });

    it('should return correct icon for Spotify', () => {
      const icon = getCompanyIcon('Spotify');
      expect(icon).toBeDefined();
      expect(icon?.color).toBe('#1DB954');
      expect(icon?.icon).toBe('music.note');
    });

    it('should handle Disney+ variations', () => {
      const icon1 = getCompanyIcon('Disney+');
      const icon2 = getCompanyIcon('Disney Plus');

      expect(icon1).toBeDefined();
      expect(icon2).toBeDefined();
      expect(icon1?.color).toBe('#113CCF');
      expect(icon2?.color).toBe('#113CCF');
    });

    it('should handle Amazon variations', () => {
      const icon = getCompanyIcon('Amazon Prime');
      expect(icon).toBeDefined();
      expect(icon?.color).toBe('#FF9900');
    });

    it('should handle utility names', () => {
      expect(getCompanyIcon('Electric Bill')?.icon).toBe('bolt.fill');
      expect(getCompanyIcon('Water Bill')?.icon).toBe('drop.fill');
      expect(getCompanyIcon('Gas Bill')?.icon).toBe('flame.fill');
    });

    it('should handle category fallbacks', () => {
      expect(getCompanyIcon('entertainment')?.icon).toBe('tv.fill');
      expect(getCompanyIcon('software')?.icon).toBe('app.fill');
    });
  });

  describe('DEFAULT_ICON', () => {
    it('should have required fields', () => {
      expect(DEFAULT_ICON.icon).toBeDefined();
      expect(DEFAULT_ICON.color).toBeDefined();
    });

    it('should use creditcard icon', () => {
      expect(DEFAULT_ICON.icon).toBe('creditcard.fill');
    });

    it('should have a neutral gray color', () => {
      expect(DEFAULT_ICON.color).toBe('#8E8E93');
    });
  });

  describe('Icon color consistency', () => {
    it('should have valid hex colors for all icons', () => {
      Object.values(COMPANY_ICONS).forEach((icon: CompanyIcon) => {
        expect(icon.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should have consistent colors for same brand variations', () => {
      expect(COMPANY_ICONS['disney+'].color).toBe(COMPANY_ICONS['disney plus'].color);
      expect(COMPANY_ICONS['hbo max'].color).toBe(COMPANY_ICONS['hbo'].color);
    });
  });
});
