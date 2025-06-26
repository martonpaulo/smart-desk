import axios from 'axios';
import type { Account, Session, NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

async function refreshAccessToken(token: JWT) {
  try {
    console.log('Refreshing access token...');
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

    console.log('Token refreshed successfully');
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
          scope:
            'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      console.log('JWT callback - account present:', !!account);
      console.log('JWT callback - token keys:', Object.keys(token));

      // Initial sign in
      if (account) {
        console.log('Initial sign in, storing tokens');
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
        console.log('Access token still valid');
        return token;
      }

      // Access token has expired, try to update it
      console.log('Access token expired, attempting refresh');
      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('Session callback - token keys:', Object.keys(token));
      console.log('Session callback - has accessToken:', !!token.accessToken);

      session.accessToken = token.accessToken as string;
      session.error = token.error as string;

      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
