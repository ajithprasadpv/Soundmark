# Vercel Postgres Database Setup Guide

This guide will help you set up Vercel Postgres for Soundmark's user authentication and subscription management.

## Step 1: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Soundmark** project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose **Free Plan** (256MB storage, 60 compute hours/month)
7. Select region: **US East (iad1)** or closest to your users
8. Click **Create**
9. Wait for database to be provisioned (~30 seconds)

## Step 2: Get Database Connection String

1. After database is created, you'll see the connection details
2. Click **Show Secret** to reveal the `DATABASE_URL`
3. Copy the entire connection string (starts with `postgres://`)
4. It will look like: `postgres://default:xxxxx@xxx-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb`

## Step 3: Update Local Environment

Add to your `.env.local` file:

```bash
# Database
DATABASE_URL="postgres://default:xxxxx@xxx-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb"
```

**Note**: The DATABASE_URL is automatically added to your Vercel project's environment variables, so you don't need to add it manually in the Vercel dashboard.

## Step 4: Generate Prisma Client

Run this command to generate the Prisma client:

```bash
cd /Users/ajith/Documents/Ambienceai/ambience-ai
npx prisma generate
```

This will create the Prisma client in `node_modules/@prisma/client`.

## Step 5: Push Database Schema

Push the schema to your Vercel Postgres database:

```bash
npx prisma db push
```

This will:
- Create all tables (User, Subscription, Organization, Account, Session, VerificationToken)
- Set up indexes and relationships
- Prepare the database for use

## Step 6: Seed the Database

Populate the database with initial admin users:

```bash
npm run db:seed
```

This will create:
- **Admin User**: admin@soundmark.app (password: Admin@123)
- **Super Admin**: superadmin@soundmark.app (password: Admin@123)
- Demo organization
- Active subscriptions for both users

## Step 7: Verify Database

You can view your database using Prisma Studio:

```bash
npm run db:studio
```

This will open a browser at `http://localhost:5555` where you can:
- View all tables
- See seeded data
- Manually add/edit/delete records
- Test queries

## Step 8: Update NextAuth to Use Database

The NextAuth configuration will automatically use the database once it's set up. The Prisma adapter is already configured in `src/lib/auth.ts`.

## Database Schema Overview

### User Table
- Stores user accounts (Google OAuth + email/password)
- Fields: id, email, name, googleId, role, status, emailVerified, image
- Relations: accounts, sessions, subscription, organization

### Subscription Table
- Manages user subscription plans
- Fields: planType (starter/professional/enterprise), status (trial/active/cancelled)
- Billing info: billingAmount, billingCycle, nextRenewal, paymentMethod

### Organization Table
- Multi-tenant support for businesses
- Links multiple users to one organization
- Fields: name, ownerId, planType, status

### NextAuth Tables
- **Account**: OAuth provider accounts (Google, etc.)
- **Session**: Active user sessions
- **VerificationToken**: Email verification tokens

## Troubleshooting

### Error: "Can't reach database server"
- Check that DATABASE_URL is correct in .env.local
- Verify Vercel Postgres database is running
- Try pinging the database from Vercel dashboard

### Error: "Prisma Client not generated"
- Run `npx prisma generate`
- Restart your development server

### Error: "Table already exists"
- Your schema is already pushed
- Run `npx prisma db push --force-reset` to reset (WARNING: deletes all data)

### Seed script fails
- Make sure DATABASE_URL is set
- Check that tables exist (run `npx prisma db push` first)
- Verify bcryptjs is installed

## Production Deployment

When deploying to Vercel:

1. **Database URL is automatic** - Vercel automatically injects DATABASE_URL for your Postgres database
2. **Prisma generates on build** - The `postinstall` script runs `prisma generate` automatically
3. **Migrations run** - Schema is pushed during build via `prisma db push` in build command

To manually seed production database:

```bash
# From Vercel dashboard, go to your project
# Settings → Environment Variables → Add DATABASE_URL to local .env
# Then run:
npm run db:seed
```

## Database Limits (Free Tier)

- **Storage**: 256 MB
- **Compute**: 60 hours/month (~2 hours/day)
- **Rows**: ~10,000-50,000 depending on data
- **Connections**: 60 concurrent

**When to upgrade ($20/month)**:
- More than 100 active users
- Need more than 60 compute hours/month
- Require 512MB+ storage

## Next Steps

After database is set up:
- ✅ Users can sign in with Google OAuth
- ✅ User accounts are stored in database
- ✅ Subscriptions are tracked
- 🔄 Phase 4: Build admin panel to manage users
- 🔄 Phase 5: Add subscription checks and access control

## Useful Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# View database in Vercel dashboard
# Go to Storage tab in your Vercel project
```
