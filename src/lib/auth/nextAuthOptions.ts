import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET } from './config';
import { refreshAccessToken } from './refreshToken';
import { REQUIRED_SCOPES, validateScopes } from './scopes';

/** NextAuth configuration for Google OAuth. */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: REQUIRED_SCOPES.join(' '),
          access_type: 'offline',
          prompt: 'consent',
          response_type: 'code',
        },
      },
    }),
  ],
  secret: NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Handle initial sign in
      if (account) {
        if (!validateScopes(account.scope)) {
          return { ...token, error: 'MissingCalendarScope' };
        }

        const expires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;

        console.debug('Storing new access token, expires at', new Date(expires));

        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: expires,
          // Preserve existing refresh token if Google does not return a new one
          refreshToken: account.refresh_token ?? token.refreshToken,
        } as JWT;
      }

      // If the access token is still valid, return the existing token
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      console.debug('Access token expired, attempting refresh');
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
