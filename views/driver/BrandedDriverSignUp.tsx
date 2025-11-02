/**
 * Branded Driver Sign Up Component
 * Wraps DriverSignUp with company branding
 */

import React, { FC, useState, useEffect } from 'react';
import DriverSignUp from './DriverSignUp';
import { getBrandingConfig } from '../../lib/branding';
import { DriverApplication } from '../../types';

interface BrandedDriverSignUpProps {
  onApplicationSubmit: (application: Omit<DriverApplication, 'id' | 'applicationDate' | 'notes' | 'status' | 'siteId'>) => void;
  onBackToLogin: () => void;
}

const BrandedDriverSignUp: FC<BrandedDriverSignUpProps> = ({
  onApplicationSubmit,
  onBackToLogin,
}) => {
  const [branding, setBranding] = useState(getBrandingConfig());

  // Listen for branding changes
  useEffect(() => {
    const handleStorageChange = () => {
      setBranding(getBrandingConfig());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Branded Header */}
      <div 
        className="py-8 px-4 text-center border-b"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColorDark} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          {branding.companyLogoUrl && (
            <img
              src={branding.companyLogoUrl}
              alt={branding.companyLogoAlt}
              className="h-12 mx-auto mb-3"
            />
          )}
          <h1 className="text-white text-2xl font-bold mb-1">Join {branding.companyName}</h1>
          <p className="text-white/80 text-sm">
            Apply to become a driver with our platform
          </p>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="py-8">
        <DriverSignUp
          onApplicationSubmit={onApplicationSubmit}
          onBackToLogin={onBackToLogin}
        />
      </div>

      {/* Branded Footer */}
      <footer className="bg-background border-t py-6 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            © {new Date().getFullYear()} {branding.companyName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`mailto:${branding.supportEmail}`} className="hover:text-foreground">
              Support: {branding.supportEmail}
            </a>
            {branding.termsUrl && (
              <a href={branding.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Terms of Service
              </a>
            )}
            {branding.privacyUrl && (
              <a href={branding.privacyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Privacy Policy
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrandedDriverSignUp;
