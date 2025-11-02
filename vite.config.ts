import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // Google API Configuration
        'process.env.VITE_GOOGLE_API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY),
        'process.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
        'process.env.VITE_GOOGLE_SHEETS_ID': JSON.stringify(env.VITE_GOOGLE_SHEETS_ID),
        'process.env.VITE_GOOGLE_DRIVE_FOLDER_ID': JSON.stringify(env.VITE_GOOGLE_DRIVE_FOLDER_ID),
        'process.env.VITE_GOOGLE_WORKSPACE_GROUP': JSON.stringify(env.VITE_GOOGLE_WORKSPACE_GROUP),
        // Branding Configuration
        'process.env.VITE_COMPANY_NAME': JSON.stringify(env.VITE_COMPANY_NAME),
        'process.env.VITE_COMPANY_LOGO_URL': JSON.stringify(env.VITE_COMPANY_LOGO_URL),
        'process.env.VITE_PRIMARY_COLOR': JSON.stringify(env.VITE_PRIMARY_COLOR),
        'process.env.VITE_SUPPORT_EMAIL': JSON.stringify(env.VITE_SUPPORT_EMAIL),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
