# Vercel deployment guide (staging + production)

This document explains how to deploy the Driver Applicants portal to Vercel using the provided serverless handler at `/api/google.ts`.

Overview
- We'll deploy a `staging` branch for testing and a `production` deployment from `main`.
- The serverless handler expects a base64-encoded service account JSON and a few environment variables.

Steps
1. Create a `staging` branch in your repository and push any changes you want to deploy there.
2. Go to https://vercel.com and import the GitHub repository. Authorize access when prompted.
3. For the project, set the following build settings (defaults are usually fine):
   - Framework: Other (Vite)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the environment variables in the Vercel project settings (Staging/Preview and Production as appropriate):
   - `GOOGLE_SERVICE_ACCOUNT_BASE64` (server-only)
   - `GOOGLE_SHEETS_ID` (server-only)
   - `GOOGLE_DRIVE_FOLDER_ID` (server-only)
   - `SERVER_API_KEY` (server-only)
   - Client branding variables (prefixed with `VITE_`) to both Preview and Production if you want them available to the browser.
5. Deploy the `staging` branch and test the form submission flow against the staging URL.

Security notes
- Never commit the service account JSON to the repo. Use Vercel environment variables.
- Restrict `SERVER_API_KEY` to a strong value and keep it server-only.
- Consider restricting CORS on the serverless handler by checking `origin` if you have a stable domain.

Testing
- Use the staging URL and POST to `/api/google` with header `x-api-key: <SERVER_API_KEY>` and a JSON body matching the expected shape:

```
{
  "applicant": {"firstName":"Jane","lastName":"Doe","email":"jane@example.com","phone":"07123 456789","area":"London","isLicensed":true},
  "attachments": [{"name":"license.jpg","mimeType":"image/jpeg","dataBase64":"<BASE64>"}]
}
```

After submission, check the Google Sheet for a new row and the Drive folder for uploaded files.
