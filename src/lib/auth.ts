import NextAuth, { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import { prisma } from './db';
import { verifyPassword } from './auth-legacy';

export const authConfig: NextAuthConfig = {
  // adapter: PrismaAdapter(prisma), // Disabled until database connection is fixed
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes, check against hardcoded admin user
        // In Phase 3, this will query the database
        const DEMO_USERS = [
          { 
            id: '1', 
            email: 'admin@soundmark.app', 
            name: 'Ajith Prasad', 
            role: 'owner',
            passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4u' // Admin@123
          },
          { 
            id: 'sa-1', 
            email: 'superadmin@soundmark.app', 
            name: 'Super Admin', 
            role: 'super_admin',
            passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4u' // Admin@123
          },
        ];

        const user = DEMO_USERS.find(u => u.email === credentials.email);
        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password as string, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'owner';
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).provider = token.provider;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For Google OAuth, we'll create user in database in Phase 3
      // For now, just allow sign in
      return true;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
