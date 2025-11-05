
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Inject branding from Vite environment variables into the window object so
// client code (getBrandingConfig) picks up server-provided values at runtime.
// These VITE_ variables are embedded at build time by Vite.
try {
  const env: any = (import.meta as any).env || {};
  const companyName = env.VITE_COMPANY_NAME || env.VITE_COMPANY || undefined;
  const companyLogoUrl = env.VITE_COMPANY_LOGO_URL || env.VITE_COMPANY_LOGO || undefined;
  const supportEmail = env.VITE_SUPPORT_EMAIL || undefined;
  if (companyName || companyLogoUrl || supportEmail) {
    (window as any).__BRANDING_CONFIG__ = {
      ...(companyName ? { companyName } : {}),
      ...(companyLogoUrl ? { companyLogoUrl } : {}),
      ...(supportEmail ? { supportEmail } : {}),
      companyLogoAlt: companyName ? `${companyName} Logo` : undefined,
    };
  }
} catch (e) {
  // non-fatal
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);