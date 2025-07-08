import axios from 'axios';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

// Required OAuth scopes for Google Calendar access
const REQUIRED_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
];

// Ensure essential environment variables are set at startup
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXTAUTH_SECRET) {
  throw new Error('Missing Google OAuth environment variables');
}

function validateScopes(grantedScope?: string) {
  if (!grantedScope) return false;
  const granted = grantedScope.split(' ');
  return REQUIRED_SCOPES.every(s => granted.includes(s));
}

async function refreshAccessToken(token: JWT) {
  if (!token.refreshToken) {
    console.error('Missing refresh token');
    return { ...token, error: 'MissingRefreshToken' };
  }
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID as string,
      client_secret: GOOGLE_CLIENT_SECRET as string,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    });
    const { data } = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (err) {
    console.error('Error refreshing access token', err);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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
      // first sign-in
      if (account) {
        if (!validateScopes(account.scope)) {
          return { ...token, error: 'MissingCalendarScope' };
        }

        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          refreshToken: account.refresh_token,
        };
      }
      // still valid
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }
      // expired → try to refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
