# Firebase Authentication Setup Guide (FREE Alternative)

Firebase Authentication is completely **FREE** for Google OAuth and much simpler to set up than Google Cloud Console directly. This guide will help you set up Firebase for Soundmark.

## Why Firebase?

- ✅ **100% Free** for authentication (unlimited users)
- ✅ **Simpler setup** than Google Cloud Console
- ✅ **Built-in UI** components available
- ✅ **Multiple providers** (Google, Facebook, Twitter, GitHub, etc.)
- ✅ **No credit card required**
- ✅ **Automatic user management**

## Free Tier Limits

Firebase Authentication is **completely free** with no limits on:
- Number of users
- Number of sign-ins
- OAuth providers (Google, Facebook, etc.)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `Soundmark` (or any name you prefer)
4. Click **Continue**
5. **Disable Google Analytics** (optional, not needed for auth)
6. Click **Create project**
7. Wait ~30 seconds for project creation
8. Click **Continue**

## Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Soundmark Web`
3. **Do NOT** check "Set up Firebase Hosting" (we're using Vercel)
4. Click **Register app**
5. You'll see Firebase SDK config - **copy this for later**:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "soundmark-xxxxx.firebaseapp.com",
     projectId: "soundmark-xxxxx",
     storageBucket: "soundmark-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx"
   };
   ```
6. Click **Continue to console**

## Step 3: Enable Google Authentication

1. In Firebase Console sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Click on **Sign-in method** tab
4. Click **Google** from the providers list
5. Toggle **Enable** to ON
6. Enter **Project support email**: Your email address
7. Click **Save**

That's it! Google OAuth is now enabled. No need to configure OAuth consent screen or redirect URIs - Firebase handles everything automatically.

## Step 4: Add Authorized Domains

Firebase automatically authorizes `localhost` and your Firebase domain. To add your custom domains:

1. In **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Add your domains:
   - `soundmark.vercel.app` (your Vercel domain)
   - `soundmark.com.co` (your custom domain, if you have one)
5. Click **Add**

## Step 5: Get Your Firebase Credentials

From the Firebase SDK config you copied earlier, you need:

1. **API Key**: `apiKey` value
2. **Auth Domain**: `authDomain` value
3. **Project ID**: `projectId` value

Add these to your `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=soundmark-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=soundmark-xxxxx

# NextAuth Configuration (keep existing)
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000

# Database (keep existing)
DATABASE_URL=postgres://...
```

**Note**: Firebase credentials are prefixed with `NEXT_PUBLIC_` because they're safe to expose in the browser. Firebase uses security rules to protect your data, not secret keys.

## Step 6: Install Firebase SDK

```bash
cd /Users/ajith/Documents/Ambienceai/ambience-ai
npm install firebase
```

## Step 7: Update NextAuth Configuration

The NextAuth configuration will be updated to use Firebase's Google OAuth credentials automatically. No additional changes needed - Firebase handles the OAuth flow.

## Alternative: Use Firebase Auth Directly (Without NextAuth)

If you prefer to use Firebase Authentication directly instead of NextAuth, you can:

**Pros:**
- Simpler setup
- Built-in Firebase UI components
- Real-time auth state
- Better Firebase integration

**Cons:**
- Need to rewrite auth logic
- Different session management
- Less flexible for multiple providers

For now, we'll stick with NextAuth + Firebase OAuth credentials, which gives you the best of both worlds.

## Step 8: Verify Setup

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. Click "Continue with Google"
4. You should see Google sign-in popup
5. After signing in, check Firebase Console → Authentication → Users
6. Your user should appear in the list

## Production Deployment

When deploying to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the Firebase environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=soundmark-xxxxx.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=soundmark-xxxxx
   ```
3. Redeploy your application

Firebase will automatically work with your production domain once you've added it to Authorized Domains.

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your domain (e.g., `soundmark.vercel.app`)

### "Firebase: Error (auth/popup-blocked)"
- Browser is blocking popups
- Allow popups for your domain
- Or use redirect method instead of popup

### "Firebase: Error (auth/operation-not-allowed)"
- Google provider is not enabled
- Go to Authentication → Sign-in method → Enable Google

### Can't see users in Firebase Console
- Users are stored in your Vercel Postgres database, not Firebase
- Firebase only handles the OAuth flow
- Check your database with `npm run db:studio`

## Firebase vs Google Cloud Console

| Feature | Firebase | Google Cloud Console |
|---------|----------|---------------------|
| **Cost** | Free forever | Free (with limits) |
| **Setup Time** | 5 minutes | 15-20 minutes |
| **OAuth Config** | Automatic | Manual |
| **Redirect URIs** | Auto-configured | Manual entry |
| **User Management** | Built-in UI | None |
| **Complexity** | Simple | Complex |
| **Best For** | Most apps | Enterprise/custom needs |

## What Firebase Gives You (Free)

1. **Authentication**: Unlimited users, unlimited sign-ins
2. **User Management**: View/manage users in Firebase Console
3. **Security**: Automatic token refresh, secure session management
4. **Analytics**: Optional user analytics
5. **Multiple Providers**: Add Facebook, Twitter, GitHub, etc. anytime

## Next Steps

After Firebase is set up:
1. ✅ Google OAuth will work automatically
2. ✅ Users can sign in with their Google accounts
3. ✅ User data is stored in your Vercel Postgres database
4. ✅ Firebase handles all OAuth complexity

## Support

Firebase Documentation:
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Web Setup Guide](https://firebase.google.com/docs/auth/web/start)
- [Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)

If you need help:
1. Check Firebase Console → Authentication → Users (to see if users are signing in)
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure authorized domains are configured
