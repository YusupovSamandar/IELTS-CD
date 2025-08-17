import authConfig from '@/auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { UserRole } from '@prisma/client';
import NextAuth, { DefaultSession, Session } from 'next-auth';
import { getAccountByUserId } from './actions/database/acount';
import { getUserById } from './actions/database/user';
import { db } from './lib/db';

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  trustHost: true, // Add this line to trust all hosts (needed for Vercel deployment)
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    signOut: '/auth/login'
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Get the current host from the request headers or use baseUrl
      const currentHost = baseUrl;

      // If url is relative, use current host
      if (url.startsWith('/')) {
        return `${currentHost}${url}`;
      }

      // If url is same origin as current host, allow it
      if (url.startsWith(currentHost)) {
        return url;
      }

      // For external URLs, redirect to current host root
      return currentHost;
    },
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true;

      let existingUser = undefined;
      if (user.id) {
        existingUser = await getUserById(user.id);
      }

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      return true;
    },
    // TODO: fix token typescript properly
    async session({ session, token }: { session: Session; token?: any }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isOAuth = token.isOAuth;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      return token;
    }
  },
  adapter: PrismaAdapter(db),
  ...authConfig
});
