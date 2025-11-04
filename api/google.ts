import { google } from 'googleapis';

// Vercel serverless handler to accept driver application submissions,
// upload attachments to Google Drive and append a row to Google Sheets.
// Security: protect with an API key in the X-API-KEY header.

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

function getServiceAccount() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_BASE64');
  try {
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_BASE64');
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.SERVER_API_KEY;
  if (apiKey) {
    const incoming = req.headers['x-api-key'] || req.headers['x-api-key'.toLowerCase()];
    if (!incoming || (Array.isArray(incoming) ? incoming[0] : incoming) !== apiKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const body = req.body;
    // Expecting JSON body: { applicant: { firstName, lastName, email, phone, area, isLicensed }, attachments: [{ name, mimeType, dataBase64 }] }
    const applicant = body.applicant || {};
    const attachments: Array<{ name: string; mimeType?: string; dataBase64: string }> = body.attachments || [];

    const sa = getServiceAccount();
    const jwt = new google.auth.JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: SCOPES
    });

    await jwt.authorize();
    const drive = google.drive({ version: 'v3', auth: jwt });
    const sheets = google.sheets({ version: 'v4', auth: jwt });

    const uploadedFiles: Array<{ id: string; name: string; webViewLink?: string }> = [];

    // Upload attachments to Drive (if any)
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    for (const f of attachments) {
      if (!f.dataBase64) continue;
      const buffer = Buffer.from(f.dataBase64, 'base64');
      const createRes = await drive.files.create({
        requestBody: {
          name: f.name,
          parents: folderId ? [folderId] : undefined
        },
        media: {
          mimeType: f.mimeType || 'application/octet-stream',
          body: Buffer.from(buffer)
        }
      });
      const fileId = createRes.data.id as string;
      // Make a webViewLink available (requires permission)
      // We'll attempt to generate a permission so the service account can view (but Drive permissions are complex depending on org)
      let webViewLink: string | undefined;
      try {
        await drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } });
        const meta = await drive.files.get({ fileId, fields: 'webViewLink' });
        webViewLink = meta.data.webViewLink || undefined;
      } catch (e) {
        // ignore permission errors; file exists and can be shared later
      }
      uploadedFiles.push({ id: fileId, name: f.name, webViewLink });
    }

    // Append a row to Sheets
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (sheetId) {
      const values = [
        new Date().toISOString(),
        applicant.firstName || '',
        applicant.lastName || '',
        applicant.email || '',
        applicant.phone || '',
        applicant.area || '',
        applicant.isLicensed ? 'Yes' : 'No',
        uploadedFiles.map(f => f.webViewLink || f.id).join(', ')
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A1',
        valueInputOption: 'RAW',
        requestBody: { values: [values] }
      });
    }

    // NOTE: Sending emails is environment-specific. Recommend using SendGrid / Mailgun or Apps Script to notify the workspace group.

    return res.status(200).json({ success: true, uploadedFiles });
  } catch (err: any) {
    console.error('api/google error', err);
    return res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}
