# Google OAuth Setup Guide

Follow these steps to set up Google OAuth for Soundmark authentication using Google Cloud Console.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `Soundmark-Auth` (or similar)
5. Click **"Create"**

## Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `Soundmark`
   - **User support email**: Select your email
   - **Developer contact email**: Enter your email
5. Click **"Save and Continue"**
6. **Scopes**: You can skip this step (click Save and Continue)
7. **Test users**: You can skip this step (click Save and Continue)
8. Click **"Back to Dashboard"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Enter name: `Soundmark Web`
5. **Authorized Javascript Origins**:
   - `http://localhost:3000`
   - `https://soundmark.vercel.app` (for production)
6. **Authorized Redirect URIs** (CRITICAL):
   - `http://localhost:3000/api/auth/callback/google`
   - `https://soundmark.vercel.app/api/auth/callback/google`
7. Click **"Create"**
8. **IMPORTANT**: Copy the **Client ID** and **Client Secret** that appear

## Step 4: Update Environment Variables

### Local Development (.env.local)

Update `/ambience-ai/.env.local` with your new credentials:

```bash
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
```

### Production (Vercel Dashboard)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL`: `https://soundmark.vercel.app`
   - `NEXTAUTH_SECRET`
5. **Redeploy** your application

## Troubleshooting Common Errors

### Error: "redirect_uri_mismatch"
- This means the URL where Google is trying to send the user back to does not EXACTLY match one of the "Authorized Redirect URIs" in the Cloud Console.
- Ensure `http://localhost:3000/api/auth/callback/google` is explicitly listed.

### Error: "Access blocked: This app's request is invalid"
- Make sure the OAuth Consent Screen is configured.
- If in "Testing" mode, ensure your email is added as a Test User (though "Published" or "In Production" status usually avoids this for personal emails).

### Error 403: "org_internal"
- If you selected "Internal" user type in Consent Screen, only users in your Workspace can login. Switch to "External" for general Gmail accounts.
