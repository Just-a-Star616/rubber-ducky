# Company Logo Display Locations

## 📍 Where Your Company Logo Appears

### 1. Login Page
```
┌─────────────────────────────────┐
│          [LOGO HERE]            │  ← Company Logo
│       Company Name              │
│   Reimagined Invoicing          │
├─────────────────────────────────┤
│ Demo Credentials                │
│ ┌─────────────────────────────┐ │
│ │  Staff: staff@demo.com      │ │
│ │  Password: demo123          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [ Log in as Staff ] [ Log in as Driver ] │
│                                 │
└─────────────────────────────────┘
```

### 2. Staff Dashboard Sidebar
```
┌──────────┬──────────────────────────────────┐
│ [LOGO]   │ Home                            │
│ H   O    │ Operations                      │
│ M   P    │ ├─ Drivers                      │
│ E   S    │ ├─ Vehicles                     │
│ ────────│ ├─ Bookings                      │
│ Finance  │ ├─ Accounts                     │
│ Admin    │ Finance                         │
│ Profile  │ Admin                           │
│          │ └─ Company Settings             │
└──────────┴──────────────────────────────────┘
   ↑
   Logo appears here in primary nav rail
```

### 3. Driver Sign Up Page
```
┌─────────────────────────────────────────────┐
│ ═════════════════════════════════════════  │
│         [COMPANY LOGO]                      │  ← Logo in header
│   Join Your Company Name                    │
│   Apply to become a driver                  │
│ ═════════════════════════════════════════  │
│                                             │
│ First Name [ _________________ ]            │
│ Last Name  [ _________________ ]            │
│ Email      [ _________________ ]            │
│            ...                              │
│                     [ Submit Application ]  │
│                                             │
└─────────────────────────────────────────────┘
```

### 4. Driver Portal Pages
```
┌─────────────────────────────────┐
│ [LOGO] Welcome, Driver Name ┌──┐│
├─────────────────────────────────┤
│                                 │
│  Dashboard                      │
│  ├─ Balance: £500              │
│  ├─ Earnings Chart             │
│  └─ Recent Invoices            │
│                                 │
│ Navigation:                     │
│ [Dashboard] [Rewards] [FAQ]     │
│ [Profile] [Vehicle] [Invoices]  │
│                                 │
└─────────────────────────────────┘
```

## 🔄 How to Update Your Logo

### Step-by-Step:

1. **Login to Staff Dashboard**
   - Email: `staff@demo.com`
   - Password: `demo123`

2. **Navigate to Company Settings**
   - Click **Admin** in the left sidebar
   - Select **Company**

3. **Upload Your Logo**
   - Look for "Company Details" section
   - Click **Edit** button
   - Click **Change** next to Company Logo
   - Select your logo file (PNG, JPG, or SVG recommended)

4. **Save**
   - Review the preview
   - Click **Save Company Details**
   - Your logo now appears everywhere!

## 📋 Best Practices

### Logo Specifications:
- **Format**: PNG, SVG, or JPG
- **Size**: 200x60px or similar aspect ratio
- **File Size**: Under 500KB (preferably <100KB)
- **Background**: Transparent PNG recommended for flexibility
- **Quality**: Use highest quality available

### Logo Examples That Work Well:
- ✅ Company name with icon/symbol
- ✅ Horizontal logo format
- ✅ Simple, clean design
- ✅ Readable at small sizes (80x40px)

### Avoid:
- ❌ Very large file sizes (>1MB)
- ❌ Only white or only black backgrounds
- ❌ Text that's too small to read
- ❌ Overly complex designs

## 🔄 Real-Time Updates

**When you upload a logo:**
1. It appears immediately in Company Admin page
2. It appears on next page load (Login, Signup, etc.)
3. Sidebar updates in current session via browser events
4. Logo persists even after browser refresh

**To reset to default logo:**
- Edit Company Details
- The logo field shows your current logo
- Select "Remove" or upload a new one
- Save changes

## 💾 Storage Information

- **Storage Method**: Browser localStorage (client-side)
- **Data Format**: Base64-encoded image
- **Persistence**: Survives browser restarts
- **Scope**: Per browser/device
- **Size Limit**: Usually 5-10MB per domain

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Logo not showing on login | Clear browser cache, re-upload in Company Admin |
| Logo appears blurry | Use PNG format instead of JPG, larger file size |
| Logo appears on some pages but not others | Wait a few seconds, refresh the page |
| Can't upload file | Ensure file is < 500KB, try PNG format |
| Lost logo after clearing cache | Re-upload logo through Company Admin |

## 📱 Responsive Design

Your logo will automatically adapt to different screen sizes:
- **Desktop**: Full size in sidebar and headers
- **Tablet**: Proportionally scaled
- **Mobile**: Optimized for small screens

## 🎨 Color Scheme Integration

Your company logo will work with:
- ✅ Light mode theme
- ✅ Dark mode theme
- ✅ Custom color themes
- ✅ All responsive breakpoints

The system uses CSS `object-contain` to preserve aspect ratio while fitting the container.
