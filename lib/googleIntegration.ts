/**
 * Google Workspace Integration Service
 * Handles Google Sheets, Google Drive, and email notifications
 */

export interface GoogleConfig {
  apiKey: string;
  clientId: string;
  clientSecret?: string;
  sheetsId: string; // Google Sheet ID for logging applications
  driveFolderId: string; // Google Drive folder ID for storing documents
  workspaceGroupEmail: string; // Google Workspace group email for notifications
  serviceAccountKey?: Record<string, any>; // For backend service account auth
}

/**
 * Load Google configuration from environment variables
 */
export const getGoogleConfig = (): GoogleConfig => {
  // Access environment variables safely
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_API_KEY || '';
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  const clientSecret = (import.meta as any).env?.VITE_GOOGLE_CLIENT_SECRET || '';
  const sheetsId = (import.meta as any).env?.VITE_GOOGLE_SHEETS_ID || '';
  const driveFolderId = (import.meta as any).env?.VITE_GOOGLE_DRIVE_FOLDER_ID || '';
  const workspaceGroupEmail = (import.meta as any).env?.VITE_GOOGLE_WORKSPACE_GROUP || '';

  return {
    apiKey,
    clientId,
    clientSecret,
    sheetsId,
    driveFolderId,
    workspaceGroupEmail,
  };
};

/**
 * Google Sheets API - Log driver application
 * Appends a new row to the Google Sheet with application details
 */
export const logApplicationToSheet = async (
  applicationData: Record<string, any>,
  accessToken: string,
  sheetsId: string
): Promise<boolean> => {
  try {
    const sheetName = 'Driver Applications';
    const range = `${sheetName}!A:Z`;

    // Prepare row data
    const values = [
      [
        applicationData.id,
        applicationData.applicationDate,
        applicationData.firstName,
        applicationData.lastName,
        applicationData.email,
        applicationData.mobileNumber,
        applicationData.area,
        applicationData.isLicensed ? 'Yes' : 'No',
        applicationData.status,
        applicationData.badgeNumber || '',
        applicationData.vehicleMake || '',
        applicationData.vehicleModel || '',
        applicationData.vehicleRegistration || '',
      ],
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${encodeURIComponent(range)}:append`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Sheets API error:', error);
      return false;
    }

    console.log('Application logged to Google Sheets successfully');
    return true;
  } catch (error) {
    console.error('Error logging application to Google Sheets:', error);
    return false;
  }
};

/**
 * Google Drive API - Upload document
 * Uploads a file to Google Drive and returns the file ID
 */
export const uploadDocumentToDrive = async (
  file: File,
  folderId: string,
  accessToken: string
): Promise<string | null> => {
  try {
    const formData = new FormData();

    // Create metadata for the file
    const metadata = {
      name: file.name,
      parents: [folderId],
      mimeType: file.type,
    };

    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    formData.append('file', file);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Drive API error:', error);
      return null;
    }

    const result = await response.json();
    console.log('File uploaded to Google Drive:', result.id);
    return result.id;
  } catch (error) {
    console.error('Error uploading document to Google Drive:', error);
    return null;
  }
};

/**
 * Get public URL for a document uploaded to Google Drive
 */
export const getGoogleDriveFileUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/view`;
};

/**
 * Send notification to Google Workspace group
 * Uses backend API to send email notification
 */
export const notifyWorkspaceGroup = async (
  groupEmail: string,
  applicationData: Record<string, any>,
  apiEndpoint: string = '/api/notify'
): Promise<boolean> => {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupEmail,
        applicationData,
        subject: `New Driver Application: ${applicationData.firstName} ${applicationData.lastName}`,
        applicant: `${applicationData.firstName} ${applicationData.lastName}`,
        email: applicationData.email,
        phone: applicationData.mobileNumber,
        area: applicationData.area,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Notification API error:', error);
      return false;
    }

    console.log('Notification sent to Google Workspace group');
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

/**
 * Initiate OAuth2 flow for Google authentication
 * Used for accessing user's Google account
 */
export const initiateGoogleOAuth = (
  clientId: string,
  redirectUri: string,
  scopes: string[] = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
  ]
): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Exchange OAuth code for access token (typically done on backend)
 */
export const exchangeOAuthCode = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
} | null> => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OAuth token exchange error:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging OAuth code:', error);
    return null;
  }
};
