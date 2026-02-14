# Using Firebase with NextAuth (Recommended)

This approach uses Firebase to get Google OAuth credentials, but keeps NextAuth for session management. **Best of both worlds!**

## Why This Approach?

- ✅ **Free Firebase OAuth** (no Google Cloud Console complexity)
- ✅ **Keep existing NextAuth code** (no rewrites needed)
- ✅ **Simple setup** (5 minutes)
- ✅ **Works with existing database** (Prisma + Vercel Postgres)

## How It Works

```
User clicks "Sign in with Google"
  ↓
NextAuth initiates OAuth flow
  ↓
Firebase handles Google OAuth (using Firebase credentials)
  ↓
NextAuth receives user info
  ↓
User stored in Vercel Postgres database
  ↓
Session managed by NextAuth
```

## Setup Steps

### 1. Create Firebase Project (5 minutes)

Follow `FIREBASE_AUTH_SETUP.md` steps 1-3:
1. Create Firebase project at https://console.firebase.google.com/
2. Register web app
3. Enable Google authentication

### 2. Get OAuth Credentials from Firebase

Instead of using Firebase SDK directly, we'll extract the OAuth credentials:

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Expand **Web SDK configuration**
4. You'll see:
   - **Web client ID**: `123456789-xxxxx.apps.googleusercontent.com`
   - **Web client secret**: Click "Show" to reveal

These are the same credentials you'd get from Google Cloud Console, but Firebase generated them automatically!

### 3. Update .env.local

```bash
# NextAuth
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (from Firebase)
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPx-xxxxx

# Database
DATABASE_URL=postgres://...
```

### 4. Add Authorized Redirect URIs in Firebase

1. In Firebase Console → Authentication → Settings → Authorized domains
2. Add your domains:
   - `localhost` (already there by default)
   - `soundmark.vercel.app`
   - `soundmark.com.co` (if you have custom domain)

That's it! Your existing NextAuth code will now use Firebase's OAuth credentials.

## No Code Changes Needed!

Your existing files work as-is:
- ✅ `src/lib/auth.ts` - No changes
- ✅ `src/app/auth/signin/page.tsx` - No changes
- ✅ `src/middleware.ts` - No changes

The only difference is you're using Firebase-generated OAuth credentials instead of manually creating them in Google Cloud Console.

## Testing

```bash
npm run dev
# Visit http://localhost:3000/auth/signin
# Click "Continue with Google"
# Sign in with your Google account
```

## Where Are Users Stored?

- **OAuth flow**: Handled by Firebase (free)
- **User data**: Stored in your Vercel Postgres database (via Prisma)
- **Sessions**: Managed by NextAuth (stored in database)

Firebase is only used to get the OAuth credentials - it doesn't store any user data.

## Cost Comparison

| Service | Cost | What It Does |
|---------|------|--------------|
| **Firebase** | Free | Provides OAuth credentials |
| **NextAuth** | Free | Manages sessions & auth logic |
| **Vercel Postgres** | Free tier (256MB) | Stores user data |

Total cost: **$0/month** 🎉

## Production Deployment

1. Add environment variables to Vercel:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL=https://soundmark.vercel.app`
   - `GOOGLE_CLIENT_ID` (from Firebase)
   - `GOOGLE_CLIENT_SECRET` (from Firebase)
   - `DATABASE_URL` (from Vercel Postgres)

2. Push to GitHub (auto-deploys)

3. Verify authorized domains in Firebase Console

## Alternative: Full Firebase Auth (Not Recommended)

If you want to use Firebase Auth SDK directly instead of NextAuth, you'd need to:
- Rewrite all auth logic
- Replace Prisma adapter
- Change session management
- Update all protected routes
- Modify middleware

**Verdict**: Not worth it. Stick with NextAuth + Firebase OAuth credentials.

## Summary

✅ **Use Firebase** to get free Google OAuth credentials  
✅ **Keep NextAuth** for session management and database integration  
✅ **No code changes** required - just update environment variables  
✅ **100% free** - no credit card needed  

This is the simplest and most cost-effective approach!
