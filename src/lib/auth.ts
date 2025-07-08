import axios from 'axios';
import type { Account, NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

// Required OAuth scopes for Google Calendar access
const REQUIRED_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
];

// Ensure essential environment variables are set at startup
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET } =
  process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXTAUTH_SECRET) {
  throw new Error('Missing Google OAuth environment variables');
}

function validateScopes(scope?: string) {
  const granted = scope?.split(' ') || [];
  return REQUIRED_SCOPES.every(s => granted.includes(s));
}

async function refreshAccessToken(token: JWT) {
  try {
    if (!token.refreshToken) {
      throw new Error('Missing refresh token');
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('Refreshing access token...');
    }
    const url = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    });

    const { data } = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Token refreshed successfully');
    }
    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT callback - account present:', !!account);
      }

      // Initial sign in
      if (account) {
        if (!validateScopes(account.scope)) {
          return { ...token, error: 'MissingCalendarScope' };
        }

        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          refreshToken: account.refresh_token,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;

      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
