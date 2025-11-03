# Troubleshooting Guide

**Project**: Project Rubber Ducky Executioner  
**Date**: November 3, 2025  
**Version**: 1.0

---

## 🔍 General Troubleshooting

### Application Won't Start

**Problem**: `npm run dev` fails to start

**Solutions**:
1. Clear node_modules and reinstall
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

2. Check Node.js version
   ```bash
   node --version  # Should be 16+
   ```

3. Check for port conflicts
   ```bash
   lsof -i :5173  # Check if port is in use
   # If in use, kill process or use different port:
   npm run dev -- --port 3000
   ```

4. Clear Vite cache
   ```bash
   rm -rf .vite node_modules/.vite
   npm run dev
   ```

---

### Build Fails

**Problem**: `npm run build` produces errors

**Solutions**:
1. Check TypeScript errors
   ```bash
   npx tsc --noEmit
   ```

2. Clear build cache
   ```bash
   rm -rf dist .vite
   npm run build
   ```

3. Check for missing dependencies
   ```bash
   npm audit
   npm install  # Re-install if needed
   ```

4. Increase Node heap size
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

---

### Slow Performance

**Problem**: Application runs slowly

**Solutions**:
1. Check for console errors
   - Open DevTools (F12)
   - Check Console tab
   - Fix any errors

2. Analyze bundle size
   ```bash
   npm run analyze
   ```

3. Check network tab
   - Look for slow API calls
   - Check asset sizes
   - Enable gzip compression

4. Clear browser cache
   - Ctrl+Shift+Delete (Windows/Linux)
   - Cmd+Shift+Delete (Mac)

---

## 🎨 Branding & Logo Issues

### Logo Not Appearing

**Problem**: Uploaded company logo doesn't display

**Solutions**:

1. Check localStorage
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('companyBranding'));
   ```

2. Clear browser cache and localStorage
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

3. Check file size
   - Max size: ~500KB
   - Use PNG or JPG format
   - Recommended: 200-300px width

4. Re-upload logo
   - Go to Admin > Company
   - Click Edit
   - Re-select and upload logo
   - Save

5. Check file format
   - Supported: PNG, JPG, SVG, GIF
   - Use URL-safe formats
   - Test with online image converter if needed

### Logo Appears Blurry

**Solutions**:
1. Use higher quality image
   - Minimum: 200x60px
   - Recommended: 400x120px
   - Use SVG for best quality

2. Check CSS
   - Review logo styling in components
   - Ensure correct aspect ratio
   - Check for scaling issues

3. Optimize image
   - Use online PNG compressor
   - Remove unnecessary metadata
   - Try WebP format

---

## 📊 Commission Rules Issues

### Commission Calculation Wrong

**Problem**: Commission amounts don't match expected values

**Solutions**:

1. Verify formula syntax
   - Check Stage 2 formula for errors
   - Ensure variables exist in Stage 1
   - Verify mathematical operators

2. Check field selection
   - Verify Stage 1 field selection
   - Confirm required fields selected
   - Check location filtering

3. Test with known values
   - Create test booking with known amount
   - Calculate expected commission manually
   - Compare with actual result

4. Verify payment method
   - Check Stage 3 payment method output
   - Ensure payment method filters correct
   - Test each payment method

5. Example debug:
   ```
   Booking: £100
   Commission Rule: 10%
   Expected: £10
   
   If different:
   1. Check formula: amount * 0.1
   2. Check field selection
   3. Check payment method applies
   4. Review output configuration
   ```

### Can't Create Scheme

**Problem**: Commission scheme creation fails

**Solutions**:
1. Complete all 3 stages
   - Stage 1: Select fields
   - Stage 2: Define formula
   - Stage 3: Configure outputs

2. Verify required fields
   - All stages must have input
   - Formula must be valid
   - At least one output required

3. Check for errors
   - Review form error messages
   - Verify formula syntax
   - Ensure no duplicate outputs

4. Check logs
   - Review browser console
   - Check activity logs
   - Look for validation errors

---

## 📦 Dispatch Interface Issues

### Booking Won't Create

**Problem**: Can't create new booking in dispatch

**Solutions**:

1. Verify required fields
   - Driver selected
   - Pickup location entered
   - Dropoff location entered
   - Amount/fare specified

2. Check permissions
   - User has dispatch-manage permission
   - User assigned to correct site

3. Test with minimal data
   - Try creating with just required fields
   - Add optional fields incrementally

4. Check logs
   - Review activity logs
   - Look for error messages
   - Check browser console

5. Clear form cache
   ```javascript
   // Clear any local form data
   localStorage.clear();
   ```

### Real-Time Updates Not Working

**Problem**: Booking status doesn't update in real-time

**Solutions**:

1. Refresh page
   ```
   F5 or Cmd+R
   ```

2. Check WebSocket (if using)
   - Open DevTools Network tab
   - Filter by WS (WebSocket)
   - Verify connection active

3. Check polling (if using intervals)
   - Look for API calls in Network tab
   - Verify calls succeed
   - Check response data

4. Clear browser cache
   - Ctrl+Shift+Delete
   - Select "Cached images and files"

---

## 🎁 Customer Promotions Issues

### Promotion Not Showing

**Problem**: Created promotion doesn't appear in list

**Solutions**:

1. Refresh page
   ```
   F5 or Cmd+R
   ```

2. Check filters
   - Review active filters
   - Clear all filters
   - Check date range

3. Verify status
   - Check promotion status (Active/Draft)
   - Check expiry date
   - Verify start date is today or earlier

4. Check logs
   - Review creation logs
   - Look for save errors
   - Check browser console

### Time-Based Scheduling Not Working

**Problem**: Promotion shows as active when it shouldn't

**Solutions**:

1. Verify schedule configuration
   ```
   Go to: Admin > Promotions > Edit [Promotion]
   Check:
   - Schedule type correct
   - Days of week selected
   - Time period in valid format (HH:mm)
   - Timezone correct
   ```

2. Check current time
   - Verify server time correct
   - Verify browser timezone correct
   - Check if daylight saving affects time

3. Verify schedule logic
   - Check docs/CUSTOMER_PROMOTIONS_GUIDE.md
   - Review schedule examples
   - Test with manual time check

4. Check overnight periods
   - For periods like 22:00-02:00
   - Verify end time is next day
   - Check formatting is correct

### Voucherify Sync Failing

**Problem**: Promotions not syncing to Voucherify

**Solutions**:

1. Check API credentials
   ```
   Verify in .env.local:
   - VITE_VOUCHERIFY_API_KEY set
   - VITE_VOUCHERIFY_WORKSPACE_ID set
   - VITE_VOUCHERIFY_CLIENT_ID set
   ```

2. Check API limits
   - Verify rate limits not exceeded
   - Check Voucherify dashboard for errors
   - Review API error logs

3. Test API connection
   ```javascript
   // In browser console:
   fetch('https://api.voucherify.io/v1/campaigns', {
     headers: {
       'Authorization': 'Bearer YOUR_API_KEY',
       'Content-Type': 'application/json'
     }
   }).then(r => r.json()).then(console.log)
   ```

4. Check network
   - Verify internet connection
   - Check if Voucherify APIs accessible
   - Verify CORS configured

---

## 📊 Logging & Audit Issues

### Logs Not Appearing

**Problem**: Activity logs empty or not updating

**Solutions**:

1. Check localStorage
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('app_logs'));
   ```

2. Clear log cache
   ```javascript
   // In browser console:
   localStorage.removeItem('app_logs');
   location.reload();
   ```

3. Verify permissions
   - User has audit-logs-view permission
   - Permission level correct (edit/view)
   - Role has required access

4. Generate test log
   - Create test action (e.g., staff change)
   - Check if logged immediately
   - Verify log appears in viewer

5. Check localStorage size
   - Max ~5-10MB available
   - May be exceeded if many logs
   - Consider server-side logging

### Can't Export Logs

**Problem**: Export to CSV/JSON fails

**Solutions**:

1. Check permissions
   - User has audit-logs-export permission
   - Check permission level

2. Clear filters
   - Remove all active filters
   - Try exporting with no filters

3. Check browser
   - Try different browser
   - Check browser console for errors
   - Verify download folder accessible

4. Check data size
   - Large exports may take time
   - May hit browser memory limits
   - Try exporting smaller date range

---

## 🚗 Driver Signup Issues

### Documents Not Uploading

**Problem**: Document upload fails or files missing

**Solutions**:

1. Check file size
   - Each file < 25MB
   - Total upload < 100MB
   - Use supported formats

2. Check Google Drive
   - Verify folder ID in .env
   - Check folder permissions
   - Verify folder exists

3. Check API credentials
   ```
   Verify in .env.local:
   - VITE_GOOGLE_CLIENT_ID set
   - VITE_GOOGLE_API_KEY set
   - VITE_GOOGLE_DRIVE_FOLDER_ID set
   ```

4. Check browser permissions
   - Allow camera/microphone if needed
   - Allow file access
   - Check browser console errors

5. Test upload
   - Try with small test file
   - Check browser Network tab
   - Look for API errors

### Application Not Logging to Sheets

**Problem**: Driver applications not appearing in Google Sheets

**Solutions**:

1. Check Sheets ID
   ```
   Verify in .env.local:
   VITE_GOOGLE_SHEETS_ID=correct_sheet_id
   ```

2. Check Sheet formatting
   - Verify sheet has headers
   - Check column names match expected
   - Review existing data format

3. Check API permissions
   - Verify service account has Sheets edit access
   - Check OAuth scopes correct
   - Review API quotas

4. Test manually
   - Open Google Sheets
   - Refresh browser
   - Manually submit test application
   - Check if appears in real-time

5. Check authentication
   - Verify OAuth token not expired
   - Re-authenticate if needed
   - Check browser console for auth errors

### Email Notifications Not Sending

**Problem**: Staff don't receive notification emails

**Solutions**:

1. Check email configuration
   ```
   Verify in .env.local:
   - VITE_GOOGLE_WORKSPACE_GROUP set to valid group
   - Group email exists in workspace
   - Group has members
   ```

2. Check Gmail forwarding
   - Verify group forwarding enabled
   - Check spam/trash folders
   - Verify email address correct

3. Test email
   - Submit test application
   - Check group email settings
   - Verify Gmail not blocking emails

4. Check API quotas
   - Review Google API quotas
   - Check if daily limit exceeded
   - Review error logs

5. Alternative: Manual notification
   - Send notification through alternate channel
   - Update contact method if needed

---

## 👥 Staff Management Issues

### Can't Create Staff Member

**Problem**: Staff creation fails with error

**Solutions**:

1. Verify required fields
   - Name entered
   - Email valid format
   - Password meets requirements

2. Check for duplicates
   - Verify email not already used
   - Check for similar names
   - Review existing staff list

3. Check permissions
   - Current user has staff-create permission
   - User assigned to correct site
   - Role allows staff management

4. Review error message
   - Note exact error text
   - Check browser console
   - Review logs for details

### Permissions Not Taking Effect

**Problem**: Permission changes don't apply immediately

**Solutions**:

1. Refresh page
   ```
   F5 or Cmd+R
   ```

2. Log out and log back in
   - Permissions refresh on login
   - Clear browser cache after logout

3. Verify permissions
   - Go to Admin > Staff
   - Edit user
   - Confirm permission template applied
   - Check individual permissions

4. Check permission inheritance
   - Verify role/template permissions correct
   - Check for overrides
   - Review permission hierarchy

---

## 🔐 Google Workspace Integration Issues

### OAuth Not Working

**Problem**: Google authentication fails

**Solutions**:

1. Check Client ID
   ```
   Verify in .env.local:
   VITE_GOOGLE_CLIENT_ID=correct_client_id
   ```

2. Check redirect URI
   - Must match Google Console settings
   - Format: https://yourdomain.com/callback
   - No trailing slash

3. Clear OAuth cache
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```

4. Test OAuth
   - Visit Google Console
   - Create new OAuth credential
   - Test with simple app first

5. Check domain
   - Verify domain accessible
   - Check HTTPS configured
   - Verify DNS records correct

### Can't Access Google Drive

**Problem**: Files not uploading to Drive

**Solutions**:

1. Verify folder permissions
   - Check Drive folder accessible
   - Verify service account has access
   - Check folder sharing settings

2. Check API scopes
   - drive.file scope required
   - Verify in OAuth configuration
   - Request new permissions if needed

3. Check quotas
   - Verify Drive storage available
   - Check upload quota not exceeded
   - Review API usage

4. Test API directly
   ```
   Use Google Drive API explorer:
   https://developers.google.com/drive/api/v3/reference
   ```

---

## 💾 Data & Storage Issues

### LocalStorage Full

**Problem**: Application shows storage full error

**Solutions**:

1. Clear old data
   ```javascript
   // In browser console:
   localStorage.clear();
   // Or selectively:
   localStorage.removeItem('app_logs');
   localStorage.removeItem('companyBranding');
   ```

2. Export and backup data
   ```javascript
   // Export logs first
   const logs = JSON.parse(localStorage.getItem('app_logs'));
   console.log(logs);  // Copy to file
   ```

3. Check storage usage
   ```javascript
   // In browser console:
   let total = 0;
   for (let key in localStorage) {
     total += localStorage[key].length;
   }
   console.log(total + ' bytes used');
   ```

4. Reduce log retention
   - Implement log pruning
   - Move old logs to server
   - Use server-side logging

---

## 🔒 Security Issues

### Suspicious Activity

**Problem**: Unusual login or activity detected

**Solutions**:

1. Check recent activity logs
   - Review activity logs for unauthorized access
   - Check login history
   - Look for suspicious operations

2. Rotate credentials
   - Change password
   - Update API keys
   - Regenerate OAuth tokens

3. Review permissions
   - Audit staff permissions
   - Remove unnecessary access
   - Check for privilege escalation

4. Enable 2FA
   - Use Google Authenticator
   - Set up backup codes
   - Configure security keys

### Possible Data Breach

**Problem**: Concerned about data security

**Solutions**:

1. Review access logs
   - Check who accessed what data
   - Look for unusual patterns
   - Review failed login attempts

2. Change credentials
   - Update all passwords
   - Rotate API keys
   - Regenerate OAuth tokens

3. Audit permissions
   - Review staff access
   - Check for unauthorized grants
   - Verify principle of least privilege

4. Enable logging
   - Enable audit logging
   - Export logs for analysis
   - Archive for compliance

---

## 📞 Getting Help

### Check Documentation
- [QUICK_START.md](./QUICK_START.md) - Setup issues
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - API issues
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment issues

### Check Activity Logs
- View detailed activity logs
- Export for analysis
- Review timestamps and changes

### Enable Debug Mode

**Browser Console:**
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');
location.reload();
```

### Collect Information
When reporting issues, include:
1. Exact error message
2. Steps to reproduce
3. Browser and version
4. Screenshot
5. Browser console errors
6. Network tab errors (if API related)

### Contact Support
- Email: support@yourcompany.com
- Include all information above
- Provide error logs if possible

---

## ✅ Preventive Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check application performance
- [ ] Verify backups working

### Monthly
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Clean up localStorage
- [ ] Audit user permissions

### Quarterly
- [ ] Full security audit
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Documentation update

---

**Last Updated**: November 3, 2025  
**Status**: Complete and Ready  
**Version**: 1.0

For more help, see: [docs/INDEX.md](./INDEX.md)
