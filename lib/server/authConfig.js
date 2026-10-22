// Canonical server authentication configuration for login and API sessions.

import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import { sessionIsCurrent } from './sessionPolicy.cjs';

function createAuthClient(accessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      ...(accessToken
        ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
        : {}),
    }
  );
}

async function resolveProfile(supabase, user, session) {
  const userId = user.id;
  const tokens = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };

  const { data: userMeta } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (userMeta) {
    return {
      id: userId,
      email: user.email,
      name: userMeta.name || '',
      role: userMeta.role,
      roles: userMeta.roles,
      partner_type: userMeta.partner_type || '',
      ...tokens,
    };
  }

  const { data: agentMeta } = await supabase
    .from('customs_agents')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (agentMeta) {
    return {
      id: userId,
      email: user.email,
      name: agentMeta.name || '',
      role: 'customs_agent',
      roles: ['customs_agent'],
      partner_type: 'customs_agent',
      ...tokens,
    };
  }

  const { data: currysUser } = await supabase
    .from('currys_users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (currysUser) {
    return {
      id: userId,
      email: user.email,
      name: currysUser.name || '',
      role: 'currys_user',
      roles: ['currys_user'],
      partner_type: 'currys',
      ...tokens,
    };
  }

  return null;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = credentials || {};
          if (!email || !password) return null;
          const supabase = createAuthClient();
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });

          if (error || !data?.user || !data.session?.access_token || !data.session?.refresh_token) {
            console.error('[NextAuth] Supabase login failed:', error?.message || error);
            return null;
          }

          return resolveProfile(supabase, data.user, data.session);
        } catch (err) {
          console.error('[NextAuth] Authorize Error:', err);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'supabase-session',
      name: 'Supabase magic link',
      credentials: {
        accessToken: { label: 'Access token', type: 'text' },
        refreshToken: { label: 'Refresh token', type: 'text' },
      },
      authorize: async (credentials) => {
        try {
          const { accessToken, refreshToken } = credentials || {};
          if (!accessToken || !refreshToken) return null;

          const supabase = createAuthClient(accessToken);
          const { data, error } = await supabase.auth.getUser(accessToken);
          if (error || !data?.user) return null;

          return resolveProfile(supabase, data.user, {
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } catch (err) {
          console.error('[NextAuth] Magic-link verification failed:', err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        delete token.error;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.roles = user.roles;
        token.partner_type = user.partner_type || '';
        token.supabaseAccessToken = user.access_token;
        token.supabaseRefreshToken = user.refresh_token;
      }
      if (!sessionIsCurrent({ user: { id: token.id, supabaseAccessToken: token.supabaseAccessToken } })) {
        delete token.supabaseAccessToken;
        delete token.supabaseRefreshToken;
        token.error = 'ReauthenticationRequired';
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        roles: token.roles,
        partner_type: token.partner_type || '',
        supabaseAccessToken: token.supabaseAccessToken,
        supabaseRefreshToken: token.supabaseRefreshToken,
      };
      if (token.error) session.error = token.error;
      return session;
    },
  },

  pages: { signIn: '/login', error: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
