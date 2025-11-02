/**
 * Branding Configuration
 * Customize company name, logo, colors, and contact information
 */

export interface BrandingConfig {
  companyName: string;
  companyLogoUrl: string;
  companyLogoAlt: string;
  primaryColor: string;
  primaryColorDark: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  supportEmail: string;
  termsUrl?: string;
  privacyUrl?: string;
}

// Default branding - customize these values
export const defaultBranding: BrandingConfig = {
  companyName: 'DarthStar Dispatch',
  companyLogoUrl: '/logo.svg',
  companyLogoAlt: 'DarthStar Dispatch Logo',
  primaryColor: '#3b82f6',
  primaryColorDark: '#1e40af',
  accentColor: '#10b981',
  contactEmail: 'dev@lv426dev.co.uk',
  contactPhone: '+44 7702 085345',
  websiteUrl: 'https://lv426dev.co.uk',
  supportEmail: 'support@lv426dev.co.uk',
  termsUrl: 'https://lv426dev.co.uk/terms',
  privacyUrl: 'https://lv426dev.co.uk/privacy',
};

// Environment-specific branding override (loaded from .env or config)
export const getBrandingConfig = (): BrandingConfig => {
  // Check for environment variables
  const branding = { ...defaultBranding };

  if (typeof window !== 'undefined') {
    // Check localStorage first for user-uploaded logo
    const storedBranding = window.localStorage.getItem('companyBranding');
    if (storedBranding) {
      try {
        const parsed = JSON.parse(storedBranding);
        return { ...branding, ...parsed };
      } catch (e) {
        console.error('Failed to parse stored branding config:', e);
      }
    }

    // Client-side config from window object (set in index.html or via script)
    const windowBranding = (window as any).__BRANDING_CONFIG__;
    if (windowBranding) {
      return { ...branding, ...windowBranding };
    }
  }

  return branding;
};

/**
 * Save branding configuration to localStorage
 */
export const saveBrandingConfig = (config: Partial<BrandingConfig>): void => {
  if (typeof window !== 'undefined') {
    const currentBranding = getBrandingConfig();
    const updated = { ...currentBranding, ...config };
    window.localStorage.setItem('companyBranding', JSON.stringify(updated));
  }
};

/**
 * Get the branding configuration singleton
 */
export let branding = getBrandingConfig();

/**
 * Update the branding singleton (call after saving to localStorage)
 */
export const updateBrandingSingleton = (): void => {
  branding = getBrandingConfig();
};
