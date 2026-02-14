# Google OAuth Setup Guide

Follow these steps to set up Google OAuth for Soundmark authentication.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `Soundmark`
5. Click **"Create"**
6. Wait for the project to be created (takes ~30 seconds)

## Step 2: Enable Google+ API

1. In the Google Cloud Console, make sure your new project is selected
2. Go to **APIs & Services** → **Library**
3. Search for "Google+ API"
4. Click on it and click **"Enable"**
5. Also search for "People API" and enable it

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `Soundmark`
   - **User support email**: Your email
   - **App logo**: (optional - can upload Soundmark logo later)
   - **Application home page**: `https://soundmark.vercel.app`
   - **Authorized domains**: 
     - `soundmark.vercel.app`
     - `vercel.app`
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. **Scopes**: Click "Add or Remove Scopes"
   - Add: `email`
   - Add: `profile`
   - Add: `openid`
7. Click **"Save and Continue"**
8. **Test users**: Add your email address for testing
9. Click **"Save and Continue"**
10. Review and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Enter name: `Soundmark Web App`
5. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://soundmark.vercel.app` (for production)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://soundmark.vercel.app/api/auth/callback/google` (for production)
7. Click **"Create"**
8. **IMPORTANT**: Copy the **Client ID** and **Client Secret** that appear

## Step 5: Update Environment Variables

### Local Development (.env.local)

Create or update `/Users/ajith/Documents/Ambienceai/ambience-ai/.env.local`:

```bash
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here

# From Google Cloud Console
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Local development URL
NEXTAUTH_URL=http://localhost:3000
```

### Production (Vercel Dashboard)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Soundmark project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `NEXTAUTH_SECRET`: (generate with `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID`: Your Google Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret
   - `NEXTAUTH_URL`: `https://soundmark.vercel.app`
5. Click **"Save"**
6. Redeploy the application for changes to take effect

## Step 6: Test the Integration

### Local Testing

1. Start the development server:
   ```bash
   cd /Users/ajith/Documents/Ambienceai/ambience-ai
   npm run dev
   ```

2. Open `http://localhost:3000/auth/signin`
3. Click **"Continue with Google"**
4. You should be redirected to Google's sign-in page
5. Sign in with your Google account
6. You should be redirected back to `/dashboard`

### Production Testing

1. Push your changes to GitHub (they'll auto-deploy to Vercel)
2. Go to `https://soundmark.vercel.app/auth/signin`
3. Click **"Continue with Google"**
4. Sign in and verify you're redirected to the dashboard

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches:
  - Local: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://soundmark.vercel.app/api/auth/callback/google`
- No trailing slashes!

### Error: "Access blocked: This app's request is invalid"
- Make sure you've enabled the Google+ API and People API
- Check that your OAuth consent screen is configured correctly
- Add your email as a test user if the app is in "Testing" mode

### Error: "Configuration error"
- Verify all environment variables are set correctly
- Make sure `NEXTAUTH_SECRET` is generated and set
- Check that `NEXTAUTH_URL` matches your current environment

### App stuck in "Testing" mode
- For production use, you'll need to submit for Google verification
- For now, you can keep it in testing mode and add specific users
- Testing mode allows up to 100 test users

## Next Steps

Once Google OAuth is working:
- ✅ Users can sign in with Google
- ✅ Email/password still works for admin@soundmark.app
- 🔄 Phase 3: Set up database to store user accounts
- 🔄 Phase 4: Build admin panel to manage users
- 🔄 Phase 5: Add route protection and subscription checks

## Security Notes

- Never commit `.env.local` to Git (it's in .gitignore)
- Rotate secrets regularly
- Keep Client Secret confidential
- Use different OAuth clients for dev/staging/production in real deployments
