# Company Logo & Branding Implementation

## Overview
The application now supports dynamic company logo and branding that automatically syncs across all pages when uploaded through the Company Administration panel.

## How It Works

### 1. **Logo Upload**
- Navigate to **Admin > Company** in the Staff Dashboard
- Click **Edit** in the "Company Details" section
- Upload your company logo using the "Change" button
- Click **Save Company Details**

### 2. **Automatic Logo Display**
Once uploaded, the company logo appears on:
- ✅ **Login Page** - In the header above the login form
- ✅ **Staff Sidebar** - In the primary navigation rail
- ✅ **Driver Sign Up Page** - In the branded header
- ✅ **Branded Driver Portal** - Across all driver pages

### 3. **Data Persistence**
Logo and branding information is stored in **browser localStorage** under the key `companyBranding`, which includes:
- `companyLogoUrl` - The base64-encoded image URL
- `companyName` - Your company name
- All other branding configuration

## Technical Implementation

### Files Modified

#### 1. **lib/branding.ts**
- Added `saveBrandingConfig()` function to store branding to localStorage
- Added `updateBrandingSingleton()` to refresh the branding state
- Enhanced `getBrandingConfig()` to check localStorage first
- Logo persists across browser sessions

#### 2. **views/Login.tsx**
- Now imports and uses `getBrandingConfig()`
- Displays company logo above title
- Shows company name instead of "Project Rubber Ducky"
- Listens for branding changes via storage events

#### 3. **components/staff/Sidebar.tsx**
- Imports `getBrandingConfig()`
- Displays company logo in sidebar header
- Falls back to default logo if none uploaded
- Reactively updates when logo changes

#### 4. **views/driver/BrandedDriverSignUp.tsx**
- Enhanced with state management for branding
- Listens for real-time branding updates
- Displays logo in the signup header

#### 5. **views/staff/CompanyAdminPage.tsx**
- Imports `saveBrandingConfig()` and `updateBrandingSingleton()`
- Logo upload now triggers `saveBrandingConfig()`
- Saves both logo and company name to localStorage

#### 6. **components/Header.tsx**
- Imports `getBrandingConfig()` for potential future enhancements

## Features

### Real-Time Updates
- When you upload a logo in Company Administration, it appears immediately on:
  - Login page (for new sessions)
  - Sidebar (for current session via storage events)
  - Sign up pages

### Fallback Support
- If no logo is uploaded, the default logo component is displayed
- The system gracefully handles missing or invalid images

### Storage Details
- Stored as **base64-encoded data URL** for offline support
- Stored in browser's **localStorage** (persists across browser restarts)
- No server upload required (demo mode - ready for backend integration)

## Frontend-Only Implementation Notes

⚠️ **Current Limitations (Demo Version)**
- Logo stored in browser localStorage (lost if browser data is cleared)
- No server-side persistence
- No image optimization/compression
- Limited to browser's localStorage size (~5-10MB)

### For Production Implementation:
1. Upload logo to backend server or CDN
2. Store file path in database
3. Update branding system to fetch from backend
4. Add image optimization/resizing
5. Use persistent storage (database)

## Usage Example

```typescript
// Get current branding configuration
import { getBrandingConfig } from './lib/branding';
const branding = getBrandingConfig();
console.log(branding.companyLogoUrl); // Base64 image URL or placeholder

// Save new branding
import { saveBrandingConfig, updateBrandingSingleton } from './lib/branding';
saveBrandingConfig({ 
  companyLogoUrl: 'data:image/png;base64,...',
  companyName: 'My Company' 
});
updateBrandingSingleton(); // Refresh the singleton
```

## Testing

1. **Upload Logo**
   - Go to Admin > Company
   - Click Edit
   - Upload a company logo (PNG, JPG, SVG)
   - Save

2. **Verify on Login**
   - Logout and return to login page
   - Logo should appear above login title

3. **Verify in Sidebar**
   - Login as staff
   - Logo should appear in sidebar header

4. **Verify on Sign Up**
   - Go to driver sign up page
   - Logo should appear in branded header

## Browser Compatibility

- ✅ Chrome/Edge (88+)
- ✅ Firefox (87+)
- ✅ Safari (14+)
- ✅ Mobile browsers

All modern browsers with:
- localStorage support
- FileReader API
- Base64 encoding

## Troubleshooting

**Logo not appearing on login page?**
- Clear browser cache and localStorage
- Log in to Admin and re-save company details
- Check browser console for errors

**Logo appearing blurry?**
- Use PNG or SVG format for best quality
- Ensure logo is at least 200x60px
- Try a smaller file size

**Storage full error?**
- Clear old branding data from localStorage
- Use smaller image file
- Consider backend storage for production

## Future Enhancements

- [ ] Multiple logo variants (light/dark mode)
- [ ] Logo size customization
- [ ] Favicon upload
- [ ] Color scheme customization per company
- [ ] Multi-tenant logo support
- [ ] CDN/backend logo storage
